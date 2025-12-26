// components/HomeEditor/SlideItem/slide-header.tsx
interface SlideHeaderProps {
     title: string;
     loading: boolean;
     isDelete: boolean;
     onDuplicate: () => void;
     onDelete: () => void;
}

export default function SlideHeader({
     title,
     loading,
     isDelete,
     onDuplicate,
     onDelete,
}: SlideHeaderProps) {
     return (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
               <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300">
                         drag_indicator
                    </span>
                    <div>
                         <h3 className="text-slate-900 dark:text-white font-bold text-base">
                              {title || "Untitled Slide"}
                         </h3>
                         <div className="flex items-center gap-2 mt-1">
                              {loading && (
                                   <span className="text-xs text-blue-600 dark:text-blue-400">
                                        Uploading...
                                   </span>
                              )}
                         </div>
                    </div>
               </div>
               <div className="flex items-center gap-1">
                    <button
                         onClick={onDuplicate}
                         className="text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                         title="Duplicate"
                         disabled={loading}
                    >
                         <span className="material-symbols-outlined text-[18px]">
                              content_copy
                         </span>
                    </button>
                    <button
                         onClick={onDelete}
                         className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         title="Delete"
                         disabled={loading || isDelete}
                    >
                         <span className="material-symbols-outlined text-[18px]">
                              delete
                         </span>
                    </button>
               </div>
          </div>
     );
}
