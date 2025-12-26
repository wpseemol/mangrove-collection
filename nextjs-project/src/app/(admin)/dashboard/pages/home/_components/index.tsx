"use client";

import ControlsPanel from "./controls-panel";
import Header from "./header";
import LivePreview from "./live-preview";


export default function HomePageEditor() {
     return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
               <div className="max-w-7xl mx-auto">
                    <Header
                         title="Home Page Editor"
                         subtitle="Manage your homepage content including slides and banners"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                         <ControlsPanel />
                         <LivePreview />
                    </div>

                    
               </div>
          </div>
     );
}
