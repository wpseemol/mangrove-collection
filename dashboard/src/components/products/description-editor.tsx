import { CharacterCount, Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading2,
  Heading3,
  Heading4,
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
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { LinkDialog } from '@/components/blog/media-dialogs'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/** Protocols accepted by the API `SafeHtml` rule for product descriptions. */
const SAFE_PROTOCOLS = /^(?:https?:|mailto:|tel:|\/(?![/\\])|#)/i

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

function Toolbar({ editor, onLink }: { editor: Editor; onLink: () => void }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive('paragraph'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      h4: e.isActive('heading', { level: 4 }),
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      strike: e.isActive('strike'),
      link: e.isActive('link'),
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      quote: e.isActive('blockquote'),
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
      <ToolButton icon={Strikethrough} label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()} />
      <ToolButton icon={Link2} label="Link" active={state.link} onClick={onLink} />
      {divider}
      <ToolButton icon={List} label="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()} />
      <ToolButton icon={ListOrdered} label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <ToolButton icon={Quote} label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()} />
      <ToolButton icon={Minus} label="Divider" onClick={() => chain().setHorizontalRule().run()} />
      {divider}
      <ToolButton icon={RemoveFormatting} label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
    </div>
  )
}

/**
 * TipTap editor for product full descriptions. Schema matches the API `SafeHtml`
 * allow-list (headings, lists, links, basic marks) — no images, video, code or
 * inline styles, so pasted junk is stripped before save.
 */
export function ProductDescriptionEditor({
  value,
  onChange,
  invalid,
  placeholder = 'Describe the product for customers…',
}: {
  value: string
  onChange: (html: string) => void
  invalid?: boolean
  placeholder?: string
}) {
  const [linkOpen, setLinkOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          isAllowedUri: (url) => SAFE_PROTOCOLS.test(url),
        },
      }),
      // Keep TextAlign out: it writes style="" attributes, which SafeHtml rejects.
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: 20000 }),
    ],
    content: value,
    editorProps: { attributes: { class: 'blog-content min-h-[16rem] px-5 py-4', 'aria-label': 'Product description' } },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML()),
  })

  useEffect(() => {
    if (editor && !editor.isFocused && value !== (editor.isEmpty ? '' : editor.getHTML())) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [editor, value])

  const chars = useEditorState({ editor, selector: ({ editor: e }) => e?.storage.characterCount.characters() ?? 0 })

  if (!editor) return null

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-background focus-within:ring-3 focus-within:ring-ring/30', invalid && 'border-destructive')}>
      <Toolbar editor={editor} onLink={() => setLinkOpen(true)} />
      <EditorContent editor={editor} />
      <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
        <span>
          {chars.toLocaleString()} / 20,000 characters
        </span>
        <span className="hidden sm:inline">Scripts, images and unsafe links are blocked.</span>
      </div>

      <LinkDialog
        open={linkOpen}
        onOpenChange={(open) => !open && setLinkOpen(false)}
        initial={(editor.getAttributes('link').href as string | undefined) ?? ''}
        onSubmit={(href) => {
          const chain = editor.chain().focus().extendMarkRange('link')
          if (href) chain.setLink({ href }).run()
          else chain.unsetLink().run()
          setLinkOpen(false)
        }}
      />
    </div>
  )
}
