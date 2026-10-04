import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { CharacterCount, Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  CodeXml,
  Film,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { ImageDialog, LinkDialog, VideoDialog } from '@/components/blog/media-dialogs'
import { Video } from '@/components/blog/video-extension'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const SAFE_PROTOCOLS = /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i

function ToolButton({ icon: Icon, label, active, disabled, onClick }: { icon: LucideIcon; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
            active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
          )}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function Toolbar({ editor, onLink, onImage, onVideo }: { editor: Editor; onLink: () => void; onImage: () => void; onVideo: () => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive('paragraph'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      h4: e.isActive('heading', { level: 4 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      left: e.isActive({ textAlign: 'left' }),
      center: e.isActive({ textAlign: 'center' }),
      right: e.isActive({ textAlign: 'right' }),
      justify: e.isActive({ textAlign: 'justify' }),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()
  const divider = <Separator orientation="vertical" className="mx-1 h-5" />

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b bg-background/95 p-1.5 backdrop-blur">
      <ToolButton icon={Undo2} label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()} />
      <ToolButton icon={Redo2} label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()} />
      {divider}
      <ToolButton icon={Pilcrow} label="Paragraph" active={state.paragraph} onClick={() => chain().setParagraph().run()} />
      <ToolButton icon={Heading2} label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} />
      <ToolButton icon={Heading3} label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} />
      <ToolButton icon={Heading4} label="Small heading" active={state.h4} onClick={() => chain().toggleHeading({ level: 4 }).run()} />
      {divider}
      <ToolButton icon={Bold} label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()} />
      <ToolButton icon={Italic} label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()} />
      <ToolButton icon={Underline} label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()} />
      <ToolButton icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()} />
      <ToolButton icon={Code} label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()} />
      <ToolButton icon={Link2} label="Link" active={state.link} onClick={onLink} />
      {divider}
      <ToolButton icon={List} label="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()} />
      <ToolButton icon={ListOrdered} label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <ToolButton icon={Quote} label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()} />
      <ToolButton icon={CodeXml} label="Code block" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()} />
      <ToolButton icon={Minus} label="Divider" onClick={() => chain().setHorizontalRule().run()} />
      {divider}
      <ToolButton icon={AlignLeft} label="Align left" active={state.left} onClick={() => chain().setTextAlign('left').run()} />
      <ToolButton icon={AlignCenter} label="Align center" active={state.center} onClick={() => chain().setTextAlign('center').run()} />
      <ToolButton icon={AlignRight} label="Align right" active={state.right} onClick={() => chain().setTextAlign('right').run()} />
      <ToolButton icon={AlignJustify} label="Justify" active={state.justify} onClick={() => chain().setTextAlign('justify').run()} />
      {divider}
      <ToolButton icon={ImagePlus} label="Insert image" onClick={onImage} />
      <ToolButton icon={Film} label="Insert video" onClick={onVideo} />
      {divider}
      <ToolButton icon={RemoveFormatting} label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
    </div>
  )
}

/**
 * Tiptap editor for blog posts. Its schema drops anything it doesn't know (scripts, styles, iframes, event
 * handlers) from typed or pasted content; the API re-checks the HTML against its allow-list on save.
 */
export function RichTextEditor({ value, onChange, invalid, placeholder = 'Start writing your story…' }: { value: string; onChange: (html: string) => void; invalid?: boolean; placeholder?: string }) {
  const [dialog, setDialog] = useState<'link' | 'image' | 'video' | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          isAllowedUri: (url) => SAFE_PROTOCOLS.test(url),
        },
      }),
      Image.configure({ allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
      Video,
    ],
    content: value,
    editorProps: { attributes: { class: 'blog-content min-h-[24rem] px-5 py-4', 'aria-label': 'Post content' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  })

  // Loading a post after the editor mounted replaces the document once, without echoing back through onChange.
  useEffect(() => {
    if (editor && !editor.isFocused && value !== (editor.isEmpty ? '' : editor.getHTML())) editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  const words = useEditorState({ editor, selector: ({ editor: e }) => e?.storage.characterCount.words() ?? 0 })

  if (!editor) return null

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background focus-within:ring-3 focus-within:ring-ring/30', invalid && 'border-destructive')}>
      <Toolbar editor={editor} onLink={() => setDialog('link')} onImage={() => setDialog('image')} onVideo={() => setDialog('video')} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
        <span>
          {words} words · about {Math.max(1, Math.round(words / 200))} min read
        </span>
        <span className="hidden sm:inline">Tip: paste a YouTube link with the video button to embed it.</span>
      </div>

      <LinkDialog
        open={dialog === 'link'}
        onOpenChange={(open) => !open && setDialog(null)}
        initial={(editor.getAttributes('link').href as string | undefined) ?? ''}
        onSubmit={(href) => {
          const chain = editor.chain().focus().extendMarkRange('link')
          if (href) chain.setLink({ href }).run()
          else chain.unsetLink().run()
          setDialog(null)
        }}
      />
      <ImageDialog
        open={dialog === 'image'}
        onOpenChange={(open) => !open && setDialog(null)}
        onSubmit={({ url, alt }) => {
          editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run()
          setDialog(null)
        }}
      />
      <VideoDialog
        open={dialog === 'video'}
        onOpenChange={(open) => !open && setDialog(null)}
        onSubmit={({ provider, url }) => {
          editor.chain().focus().setVideo({ provider, src: url }).run()
          setDialog(null)
        }}
      />
    </div>
  )
}
