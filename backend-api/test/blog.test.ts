import { describe, expect, it } from 'vitest'
import { prisma } from '../src/lib/prisma.js'
import { storage } from '../src/lib/storage.js'
import { isSafeBlogHtml } from '../src/validation/rules.js'
import { isVideoUrl } from '../src/services/blog.js'
import { makeAdmin, makeManager, makeUser } from './factories.js'
import { actingAs, diskFiles, expectErrors, expectStatus, fakeFile, storefront } from './helpers.js'

const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const mp4 = () => Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(64)])

describe('blog HTML', () => {
  const safe = (html: string) => isSafeBlogHtml(html, isVideoUrl)

  it('accepts what the editor produces', () => {
    expect(safe('<h2 style="text-align: center;">Hi</h2><p>Text <strong>bold</strong> <a href="https://x.com" target="_blank" rel="noopener noreferrer nofollow">link</a></p>')).toBe(true)
    expect(safe('<pre><code class="language-js">const a = 1</code></pre><ol start="3"><li><p>x</p></li></ol>')).toBe(true)
    expect(safe('<img src="https://cdn.example.com/a.jpg" alt="Mangrove"><hr>')).toBe(true)
    expect(safe(`<figure data-video="youtube" data-src="${YOUTUBE}"></figure>`)).toBe(true)
    expect(safe(`<figure data-video="upload" data-src="${storage.url('public', 'uploads/2026/10/abc.mp4')}"></figure>`)).toBe(true)
  })

  it('rejects scripts, handlers, iframes and foreign embeds', () => {
    expect(safe('<script>alert(1)</script>')).toBe(false)
    expect(safe('<img src="https://x.com/a.jpg" onerror="alert(1)">')).toBe(false)
    expect(safe('<iframe src="https://evil.com"></iframe>')).toBe(false)
    expect(safe('<a href="javascript:alert(1)">x</a>')).toBe(false)
    expect(safe('<p style="color:red">x</p>')).toBe(false)
    expect(safe('<img src="data:image/png;base64,AAAA">')).toBe(false)
    expect(safe('<figure data-video="youtube" data-src="https://evil.com/watch?v=dQw4w9WgXcQ"></figure>')).toBe(false)
    expect(safe('<figure data-video="upload" data-src="https://evil.com/storage/uploads/a.mp4"></figure>')).toBe(false)
    expect(safe('<p title="x">x</p>')).toBe(false)
    expect(safe('<img src=https://x.com/a.jpg onerror=alert(1)>')).toBe(false)
    expect(safe('<p>a</p class="x">')).toBe(false)
    expect(safe('<p>1 < 2 <svg/onload=alert(1)></p>')).toBe(false)
  })
})

describe('managing the blog', () => {
  it('lets admins and employees create categories with an icon and posts with images and videos', async () => {
    const admin = await actingAs(await makeAdmin())
    const manager = await actingAs(await makeManager())

    const category = await admin.post('/v1/admin/blog/categories', { name: 'Mangrove Stories', icon: 'leaf', description: 'From the forest' })
    expectStatus(category, 201)
    expect(category.body.data).toMatchObject({ slug: 'mangrove-stories', icon: 'leaf', posts_count: 0 })
    expect(category.body.data.icon_nodes).not.toBeNull()
    expectErrors(await admin.post('/v1/admin/blog/categories', { name: 'Bad', icon: 'not-an-icon' }), 'icon')

    const res = await manager.post('/v1/admin/blog/posts', {
      title: 'Honey season in the Sundarbans',
      blog_category_id: category.body.data.id,
      excerpt: 'How wild honey is collected.',
      content: `<h2>Collecting honey</h2><p>Every April…</p><figure data-video="youtube" data-src="${YOUTUBE}"></figure>`,
      cover_image: 'https://cdn.example.com/cover.jpg',
      tags: ['honey', 'sundarbans'],
      status: 'published',
      media: [
        { type: 'image', url: 'https://cdn.example.com/1.jpg', caption: 'Hive' },
        { type: 'image', url: 'https://cdn.example.com/2.jpg' },
        { type: 'video', url: 'https://youtu.be/dQw4w9WgXcQ' },
        { type: 'video', url: 'https://vimeo.com/123456789' },
      ],
    })
    expectStatus(res, 201)
    const post = res.body.data
    expect(post).toMatchObject({ slug: 'honey-season-in-the-sundarbans', status: 'published', category: { name: 'Mangrove Stories' } })
    expect(post.published_at).not.toBeNull()
    expect(post.media.map((m: { provider: string }) => m.provider)).toEqual(['upload', 'upload', 'youtube', 'vimeo'])
    expect(post.media[2].embed_url).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ')

    const list = await admin.get('/v1/admin/blog/posts')
    expect(list.body.counts).toEqual({ draft: 0, published: 1 })
    expect(list.body.data[0]).toMatchObject({ images_count: 2, videos_count: 2 })

    const updated = await admin.patch(`/v1/admin/blog/posts/${post.id}`, { status: 'draft', media: [] })
    expectStatus(updated, 200)
    expect(updated.body.data.media).toEqual([])
    expect(await prisma.blogPostMedia.count()).toBe(0)

    expectStatus(await admin.delete(`/v1/admin/blog/categories/${category.body.data.id}`), 204)
    expect((await prisma.blogPost.findUniqueOrThrow({ where: { id: BigInt(post.id) } })).blog_category_id).toBeNull()

    expectStatus(await manager.delete(`/v1/admin/blog/posts/${post.id}`), 204)
  })

  it('validates every field against HTML, script and SQL injection', async () => {
    const admin = await actingAs(await makeAdmin())

    expectErrors(
      await admin.post('/v1/admin/blog/posts', {
        title: "x' OR '1'='1",
        excerpt: '<b>hi</b>',
        content: '<p onclick="steal()">x</p>',
        tags: ['ok', '1; DROP TABLE users; --'],
        cover_image: 'javascript:alert(1)',
        meta_title: 'UNION SELECT password FROM users',
        slug: 'Bad Slug!',
        media: [{ type: 'video', url: 'https://evil.com/video.mp4' }, { type: 'gif', url: 'https://x.com/a.gif' }],
      }),
      ['title', 'excerpt', 'content', 'tags.1', 'cover_image', 'meta_title', 'slug', 'media.0.url', 'media.1.type'],
    )
    expectErrors(await admin.post('/v1/admin/blog/categories', { name: '<script>x</script>' }), 'name')
    expectErrors(await admin.get('/v1/admin/blog/posts?q=1%27%20UNION%20SELECT%201--'), 'q')
    expect(await prisma.blogPost.count()).toBe(0)
  })

  it('uploads MP4 videos and rejects anything else', async () => {
    const admin = await actingAs(await makeAdmin())

    const res = await admin.post('/v1/admin/media/videos', {}, { file: fakeFile('clip.mp4', 0, 'video/mp4', mp4()) })
    expectStatus(res, 201)
    expect(res.body.data.mime_type).toBe('video/mp4')
    expect(res.body.data.url).toMatch(/\/storage\/uploads\/\d{4}\/\d{2}\/\w+\.mp4$/)
    expect(diskFiles('public')).toHaveLength(1)
    expect(isVideoUrl('upload', res.body.data.url)).toBe(true)

    expectErrors(await admin.post('/v1/admin/media/videos', {}, { file: fakeFile('fake.mp4', 2, 'video/mp4') }), 'file')
    expectErrors(await admin.post('/v1/admin/media/videos', {}, { file: fakeFile('shell.php', 1, 'video/mp4', '<?php system($_GET["c"]); ?>' + ' '.repeat(20)) }), 'file')
    expect(diskFiles('public')).toHaveLength(1)
  })

  it('keeps customers and guests out', async () => {
    expectStatus(await (await actingAs(await makeUser())).get('/v1/admin/blog/posts'), 403)
    expectStatus(await storefront().post('/v1/admin/blog/categories', { name: 'Nope' }), 401)
  })
})

describe('public blog', () => {
  it('shows only published posts whose date has come, and counts views', async () => {
    const admin = await actingAs(await makeAdmin())
    const category = (await admin.post('/v1/admin/blog/categories', { name: 'Recipes', icon: 'leaf' })).body.data
    const hidden = (await admin.post('/v1/admin/blog/categories', { name: 'Hidden', is_active: false })).body.data

    await admin.post('/v1/admin/blog/posts', { title: 'Live post', blog_category_id: category.id, status: 'published', media: [{ type: 'image', url: 'https://x.com/a.jpg' }] })
    await admin.post('/v1/admin/blog/posts', { title: 'Draft post', status: 'draft' })
    await admin.post('/v1/admin/blog/posts', { title: 'Scheduled post', status: 'published', published_at: '2099-01-01T00:00:00Z' })
    await admin.post('/v1/admin/blog/posts', { title: 'In hidden category', blog_category_id: hidden.id, status: 'published' })

    const list = await storefront().get('/v1/blog/posts')
    expectStatus(list, 200)
    expect(list.body.data.map((post: { title: string }) => post.title)).toEqual(['Live post'])
    expect(list.body.data[0]).not.toHaveProperty('content')

    expect((await storefront().get('/v1/blog/posts?category=recipes')).body.data).toHaveLength(1)
    expect((await storefront().get('/v1/blog/categories')).body.data.map((c: { name: string; posts_count: number }) => [c.name, c.posts_count])).toEqual([['Recipes', 1]])

    const detail = await storefront().get('/v1/blog/posts/live-post')
    expectStatus(detail, 200)
    expect(detail.body.data.media).toHaveLength(1)
    expect((await prisma.blogPost.findUniqueOrThrow({ where: { slug: 'live-post' } })).views).toBe(1)

    expectStatus(await storefront().get('/v1/blog/posts/draft-post'), 404)
    expectStatus(await storefront().get('/v1/blog/posts/scheduled-post'), 404)
  })
})
