"use client";

import React from "react";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plus, Trash2, Save, Type, AlignLeft } from "lucide-react";
import { useAboutSection } from "@/hooks";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import Link from "@tiptap/extension-link";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Link as LinkIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { aboutSectionSchema } from "@/lib/schemas/zod/about-section-schema";
import { addUpdateAboutSectionDetails } from "@/lib/actions/home-page-details";
import { toast } from "sonner";

export default function AboutEditUpdateForm() {
    const { sections, setSections } = useAboutSection();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting }, // 2. Extract errors
    } = useForm<FormValues>({
        resolver: zodResolver(aboutSectionSchema), // 3. Connect Resolver
        defaultValues: {
            sections: sections,
        },
        mode: "onChange", // Validates as user types
    });

    // Debug: Log form errors

    const { fields, append, remove } = useFieldArray({
        control,
        name: "sections",
    });

    // 1. Watch form values in real-time
    const watchedSections = useWatch({
        control,
        name: "sections",
    });

    // 2. Sync form changes to Global Context
    React.useEffect(() => {
        if (watchedSections) {
            setSections(watchedSections as Section[]);
        }
    }, [watchedSections, setSections]);

    const onSubmit = async (data: FormValues) => {
        const response = await addUpdateAboutSectionDetails(
            JSON.stringify(data),
        );

        if (!response.success) {
            toast.error(response.message);
            return;
        }

        if (response.success) {
            toast.success(
                response.message || "About section updated successfully!",
            );

            return;
        }

        // Integration point for your Laravel API
        // fetch('/api/update-about', { method: 'POST', body: JSON.stringify(data) })
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-xl border border-gray-100 my-12">
            <header className="mb-10 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Edit About Section
                </h1>
                <p className="text-gray-500 mt-2">
                    Add, edit, or remove dynamic sections for your landing page.
                </p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                {fields.map((field, index) => {
                    // Extract specific errors for this index
                    const titleError = errors.sections?.[index]?.title;
                    const descError = errors.sections?.[index]?.description;

                    return (
                        <div
                            key={field.id}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:border-blue-200"
                        >
                            {fields.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                {/* Title Field */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        <Type
                                            size={16}
                                            className="text-blue-600"
                                        />{" "}
                                        Section Title
                                    </label>
                                    <input
                                        {...register(
                                            `sections.${index}.title` as const,
                                        )}
                                        className={`w-full px-4 py-3 bg-white border rounded-lg outline-none transition-all text-black ${
                                            titleError
                                                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                                                : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                                        }`}
                                    />
                                    {titleError && (
                                        <p className="text-red-500 text-xs font-medium italic">
                                            {titleError.message}
                                        </p>
                                    )}
                                </div>

                                {/* Description Field */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                        <AlignLeft
                                            size={16}
                                            className="text-green-600"
                                        />{" "}
                                        Description
                                    </label>
                                    <Controller
                                        control={control}
                                        name={
                                            `sections.${index}.description` as const
                                        }
                                        render={({
                                            field: { onChange, value },
                                        }) => (
                                            <div
                                                className={
                                                    descError
                                                        ? "ring-2 ring-red-500 rounded-md"
                                                        : ""
                                                }
                                            >
                                                <TiptapEditor
                                                    value={value}
                                                    onChange={onChange}
                                                />
                                            </div>
                                        )}
                                    />
                                    {descError && (
                                        <p className="text-red-500 text-xs font-medium italic">
                                            {descError.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="flex flex-col md:flex-row gap-4 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-100 shadow-lg">
                    <button
                        disabled={isSubmitting}
                        type="button"
                        onClick={() =>
                            append({
                                id: generateUniqueIds({
                                    count: 1,
                                    pattern: "***",
                                }) as string,
                                title: "",
                                description: "",
                            })
                        }
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-800 text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Plus size={20} /> Add New Section
                    </button>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md active:scale-[0.98]"
                    >
                        <Save size={20} /> Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

// --- Types ---
interface Section {
    id: string; // Unique ID for database and editing
    title: string;
    description: string;
}

interface FormValues {
    sections: Section[];
}

// --- Optimized Tiptap Editor Component ---

const TiptapEditor = React.memo(
    ({
        value,
        onChange,
    }: {
        value: string;
        onChange: (val: string) => void;
    }) => {
        const editor = useEditor({
            extensions: [
                StarterKit.configure({
                    // StarterKit includes Heading and BulletList by default
                    heading: { levels: [1, 2, 3] },
                }),
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        class: "text-blue-600 underline cursor-pointer",
                    },
                }),
            ],
            content: value,
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                if (html !== value) {
                    onChange(html);
                }
            },
            editorProps: {
                attributes: {
                    class: "prose prose-sm focus:outline-none min-h-[150px] p-4 bg-white text-black shadow-inner",
                },
            },
        });

        // Sync external value changes
        React.useEffect(() => {
            if (editor && value !== editor.getHTML()) {
                editor.commands.setContent(value);
            }
        }, [value, editor]);

        if (!editor) return null;

        // --- Toolbar Logic ---
        const addLink = () => {
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
        };

        return (
            <div className="border rounded-md overflow-hidden bg-white border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                {/* Simple Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 1 })}
                    >
                        <Heading1 size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 2 })}
                    >
                        <Heading2 size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        active={editor.isActive("bold")}
                    >
                        <Bold size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        active={editor.isActive("italic")}
                    >
                        <Italic size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        active={editor.isActive("bulletList")}
                    >
                        <List size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        active={editor.isActive("orderedList")}
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={addLink}
                        active={editor.isActive("link")}
                    >
                        <LinkIcon size={18} />
                    </ToolbarButton>
                </div>

                <EditorContent editor={editor} />
            </div>
        );
    },
);

// Helper Toolbar Component
const ToolbarButton = ({ children, onClick, active }: any) => (
    <button
        type="button" // Important: prevents form submission
        onClick={onClick}
        className={`p-2 rounded transition-colors ${
            active
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-200"
        }`}
    >
        {children}
    </button>
);

TiptapEditor.displayName = "TiptapEditor";
