"use client";
import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import {
     Tooltip,
     TooltipContent,
     TooltipTrigger,
} from "@/components/ui/tooltip";
import { Editor } from "@tiptap/react";
import {
     Bold,
     ChevronDown,
     Code,
     Heading1,
     Heading2,
     Heading3,
     Highlighter,
     Italic,
     List,
     ListOrdered,
     Quote,
     Redo,
     Strikethrough,
     Tag,
     Undo,
} from "lucide-react";

export default function TiptapMenuBar({ editor }: { editor: Editor | null }) {
     if (!editor) return null;

     const options = [
          {
               id: "bold",
               command: () => editor.chain().focus().toggleBold().run(),
               isActive: editor?.isActive("bold"),
               label: "Bold",
               icon: <Bold className="w-4 h-4" />,
          },
          {
               id: "italic",
               command: () => editor.chain().focus().toggleItalic().run(),
               isActive: editor.isActive("italic"),
               label: "Italic",
               icon: <Italic className="w-4 h-4" />,
          },
          {
               id: "strike",
               command: () => editor.chain().focus().toggleStrike().run(),
               isActive: editor.isActive("strike"),
               label: "Strike",
               icon: <Strikethrough className="w-4 h-4" />,
          },
          {
               id: "lists",
               component: (
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Toggle size="sm" className="gap-1">
                                   <List className="w-4 h-4" />
                                   <ChevronDown className="w-3 h-3" />
                              </Toggle>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent className="bg-gray-100 border-gray-200">
                              {LIST_TYPES.map((listType) => (
                                   <DropdownMenuItem
                                        key={listType.id}
                                        onSelect={() => {
                                             if (
                                                  listType.id === "bullet-list"
                                             ) {
                                                  editor
                                                       .chain()
                                                       .focus()
                                                       .toggleBulletList()
                                                       .run();
                                             } else if (
                                                  listType.id === "ordered-list"
                                             ) {
                                                  editor
                                                       .chain()
                                                       .focus()
                                                       .toggleOrderedList()
                                                       .run();
                                             }
                                        }}
                                        className="flex items-center gap-2"
                                   >
                                        {listType.icon}
                                        {listType.label}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>
               ),
               label: "Lists",
          },
          {
               id: "highlight",
               component: (
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                              <Toggle
                                   size="sm"
                                   pressed={editor.isActive("highlight")}
                                   className="gap-1"
                              >
                                   <Highlighter className="w-4 h-4" />
                                   <ChevronDown className="w-3 h-3" />
                              </Toggle>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent className="bg-gray-100 border-gray-200">
                              <DropdownMenuItem
                                   onSelect={() =>
                                        editor
                                             .chain()
                                             .focus()
                                             .unsetHighlight()
                                             .run()
                                   }
                              >
                                   Remove Highlight
                              </DropdownMenuItem>
                              {HIGHLIGHT_COLORS.map((color) => (
                                   <DropdownMenuItem
                                        key={color.value}
                                        onSelect={() =>
                                             editor
                                                  .chain()
                                                  .focus()
                                                  .toggleHighlight({
                                                       color: color.value,
                                                  })
                                                  .run()
                                        }
                                        className="flex items-center gap-2"
                                   >
                                        <span
                                             className="w-4 h-4 rounded-full inline-block"
                                             style={{
                                                  backgroundColor: color.value,
                                             }}
                                        />
                                        {color.name}
                                   </DropdownMenuItem>
                              ))}
                         </DropdownMenuContent>
                    </DropdownMenu>
               ),
               label: "Highlight",
          },
          // ... rest of your options (blockquote, code-block, headings, etc.)
          {
               id: "blockquote",
               command: () => editor.chain().focus().toggleBlockquote().run(),
               isActive: editor.isActive("blockquote"),
               label: "Blockquote",
               icon: <Quote className="w-4 h-4" />,
          },
          {
               id: "code-block",
               command: () => editor.chain().focus().toggleCodeBlock().run(),
               isActive: editor.isActive("codeBlock"),
               label: "Code Block",
               icon: <Code className="w-4 h-4" />,
          },
          {
               id: "heading-1",
               command: () =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run(),
               isActive: editor.isActive("heading", { level: 1 }),
               label: "H1",
               icon: <Heading1 className="w-4 h-4" />,
          },
          {
               id: "heading-2",
               command: () =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run(),
               isActive: editor.isActive("heading", { level: 2 }),
               label: "H2",
               icon: <Heading2 className="w-4 h-4" />,
          },
          {
               id: "heading-3",
               command: () =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run(),
               isActive: editor.isActive("heading", { level: 3 }),
               label: "H3",
               icon: <Heading3 className="w-4 h-4" />,
          },
          {
               id: "undo",
               command: () => editor.chain().focus().undo().run(),
               isActive: false,
               label: "Undo",
               icon: <Undo className="w-4 h-4" />,
          },
          {
               id: "redo",
               command: () => editor.chain().focus().redo().run(),
               isActive: false,
               label: "Redo",
               icon: <Redo className="w-4 h-4" />,
          },
          {
               id: "add-link",
               command: () => {
                    const previousUrl = editor.getAttributes("link").href;
                    const url = window.prompt("Enter URL", previousUrl);

                    if (url === null) return;

                    if (url === "") {
                         editor
                              .chain()
                              .focus()
                              .extendMarkRange("link")
                              .unsetLink()
                              .run();
                         return;
                    }

                    editor
                         .chain()
                         .focus()
                         .extendMarkRange("link")
                         .setLink({ href: url })
                         .run();
               },
               isActive: editor.isActive("link"),
               label: "Add Link",
               icon: (
                    <svg
                         className="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth={2}
                         viewBox="0 0 24 24"
                    >
                         <path d="M10 14a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1-7.07 7.07l-1.41-1.41" />
                         <path d="M14 10a5 5 0 0 0-7.07 0l-1.41 1.41a5 5 0 0 0 7.07 7.07l1.41-1.41" />
                    </svg>
               ),
          },
          {
               id: "add-image",
               command: () => {
                    const url = window.prompt("Enter image URL");
                    if (url) {
                         editor
                              .chain()
                              .focus()
                              .setImage({
                                   src: url,
                                   alt: "Image",
                                   title: "Image",
                              })
                              .run();
                    }
               },
               isActive: false,
               label: "Add Image",
               icon: (
                    <svg
                         className="w-4 h-4"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth={2}
                         viewBox="0 0 24 24"
                    >
                         <rect x="3" y="3" width="18" height="18" rx="2" />
                         <circle cx="8.5" cy="8.5" r="1.5" />
                         <path d="M21 15l-5-5L5 21" />
                    </svg>
               ),
          },
          {
               id: "add-tag",
               command: () => {
                    const tag = window.prompt("Enter tag name");
                    if (tag) {
                         editor
                              .chain()
                              .focus()
                              .toggleNode("paragraph", "tag", { id: tag })
                              .run();
                    }
               },
               isActive: editor.isActive("tag"),
               label: "Add Tag",
               icon: <Tag className="w-4 h-4" />,
          },
     ];

     return (
          <div className="flex flex-wrap gap-1 p-1 border border-gray-200 rounded-md bg-background">
               {options.map((option) => (
                    <Tooltip key={option.id}>
                         <TooltipTrigger asChild>
                              {option.component ? (
                                   option.component
                              ) : (
                                   <Toggle
                                        aria-label={`Toggle ${option.label}`}
                                        pressed={option.isActive}
                                        onPressedChange={() => option.command()}
                                        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
                                        size="sm"
                                   >
                                        {option.icon}
                                   </Toggle>
                              )}
                         </TooltipTrigger>
                         <TooltipContent side="top" className="text-white">
                              {option.label}
                         </TooltipContent>
                    </Tooltip>
               ))}
          </div>
     );
}

// Predefined highlight colors
const HIGHLIGHT_COLORS = [
     { name: "Yellow", value: "#fef08a" },
     { name: "Blue", value: "#bfdbfe" },
     { name: "Pink", value: "#fbcfe8" },
];

// List types
const LIST_TYPES = [
     {
          id: "bullet-list",
          label: "Bullet List",
          icon: <List className="w-4 h-4" />,
     },
     {
          id: "ordered-list",
          label: "Numbered List",
          icon: <ListOrdered className="w-4 h-4" />,
     },
];
