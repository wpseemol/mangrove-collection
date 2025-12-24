"use client";

import { addSlide } from "@/store/features/homeEditorSlice";
import { useAppDispatch } from "@/store/hook";

export default function MobileFAB() {
     const dispatch = useAppDispatch();

     const handleAddSlide = () => {
          dispatch(addSlide());
     };

     return (
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
               <button
                    onClick={handleAddSlide}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
               >
                    <span className="material-symbols-outlined text-2xl">
                         add
                    </span>
               </button>
          </div>
     );
}
