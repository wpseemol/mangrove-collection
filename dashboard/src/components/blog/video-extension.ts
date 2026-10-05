import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { VideoNodeView } from '@/components/blog/video-node-view'
import type { VideoProvider } from '@/lib/types'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { provider: VideoProvider; src: string }) => ReturnType
    }
  }
}

/** A block video stored as `<figure data-video="youtube|vimeo|upload" data-src="…"></figure>`; the storefront turns it into a player. */
export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      provider: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-video'),
        renderHTML: (attributes) => ({ 'data-video': attributes.provider }),
      },
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-src'),
        renderHTML: (attributes) => ({ 'data-src': attributes.src }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-video]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView)
  },

  addCommands() {
    return {
      setVideo:
        (options) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
