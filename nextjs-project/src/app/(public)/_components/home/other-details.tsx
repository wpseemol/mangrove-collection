import { defaultAboutData } from "@/db/home/sliderContent";
import { getAboutSectionData } from "@/lib/actions/home-page-details";
import { DetailsSectionType } from "@/types/home";
import * as motion from "motion/react-client";

export default async function OtherDetails() {
    const response = await getAboutSectionData();

    let aboutData: DetailsSectionType[] = [];

    if (response.success && response.data) {
        const data = JSON.parse(response.data) as {
            detailsSections: DetailsSectionType[];
        };
        aboutData = data.detailsSections;
    } else {
        aboutData = defaultAboutData;
    }

    return (
        <section className="py-10 bg-slate-50 scroll-mt-3" id="about">
            <div className="container mx-auto px-4">
                {/* Section Header */}

                {/* Dynamic Data Loop */}
                <div className="space-y-8">
                    {aboutData &&
                        aboutData.length > 0 &&
                        aboutData.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className=" flex flex-col"
                            >
                                {/* Title with Editable Option */}
                                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <span className="text-green-500">🚣</span>
                                    {item.title}
                                </h3>

                                {/* Description with Editable Option */}
                                <div
                                    className="text-slate-600 leading-relaxed flex-grow tiptap ProseMirror prose prose-sm focus:outline-none"
                                    dangerouslySetInnerHTML={{
                                        __html: item.description,
                                    }}
                                />
                            </motion.div>
                        ))}
                </div>
            </div>
        </section>
    );
}
