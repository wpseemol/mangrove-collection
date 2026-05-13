"use client";

import { useAboutSection } from "@/hooks";
import { motion } from "framer-motion";

export default function AboutSectionLivePreview() {
    const { sections } = useAboutSection();

    return (
        <>
            <div className="p-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    About Section Live Preview
                </h2>
                <p className="text-slate-600">
                    This is a live preview of the about section.
                </p>
            </div>

            <div className="space-y-2 ">
                {sections &&
                    sections.length > 0 &&
                    sections.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            viewport={{ once: true }}
                            className=" p-8 flex flex-col"
                        >
                            {/* Title with Editable Option */}
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="text-green-500">●</span>
                                {item.title}
                            </h3>

                            {/* Description with Editable Option */}
                            <div
                                className="text-slate-600 leading-relaxed flex-grow tiptap ProseMirror prose prose-sm focus:outline-none min-h-[150px] p-4"
                                dangerouslySetInnerHTML={{
                                    __html: item.description,
                                }}
                            />
                        </motion.div>
                    ))}
            </div>
        </>
    );
}
