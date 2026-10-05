import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { Trash2 } from 'lucide-react'

import { embedUrl, PROVIDER_LABELS } from '@/lib/video'
import type { VideoProvider } from '@/lib/types'
import { cn } from '@/lib/utils'

/** Editor preview of a video block. The saved HTML is only a `<figure data-video data-src>` placeholder. */
export function VideoNodeView({ node, selected, deleteNode, editor }: ReactNodeViewProps) {
  const provider = node.attrs.provider as VideoProvider
  const src = node.attrs.src as string
  const embed = provider === 'upload' ? null : embedUrl(src)

  return (
    <NodeViewWrapper className={cn('my-4 overflow-hidden rounded-lg border bg-black', selected && 'ring-2 ring-primary ring-offset-2')} data-drag-handle>
      <div className="relative aspect-video">
        {provider === 'upload' ? (
          <video src={src} controls preload="metadata" className="size-full" />
        ) : embed ? (
          <iframe
            src={embed}
            title={PROVIDER_LABELS[provider]}
            className="pointer-events-none size-full"
            allow="encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <p className="flex size-full items-center justify-center text-sm text-white/70">This video link is not supported.</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 bg-muted px-3 py-1.5 text-xs text-muted-foreground" contentEditable={false}>
        <span className="truncate">
          {PROVIDER_LABELS[provider] ?? 'Video'} · {src}
        </span>
        {editor.isEditable && (
          <button type="button" onClick={deleteNode} className="flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="size-3.5" /> Remove
          </button>
        )}
      </div>
    </NodeViewWrapper>
  )
}
