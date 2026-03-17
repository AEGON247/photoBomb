"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function GuidelinesModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 z-10 bg-slate-800/50 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-8 border-b border-slate-800 pb-4">
            PhotoBomb by Sachin
          </h2>
          <div className="space-y-6 text-slate-300">
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Sign In</h3>
                <p className="leading-relaxed">Start by signing in with your Google account. This gives PhotoBomb the necessary access to scan your Google Drive securely.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Select Target Folder</h3>
                <p className="leading-relaxed">Paste the link to the Google Drive folder containing the photos you want to search. We will scan all images inside this folder.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">3</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Reference Face</h3>
                <p className="leading-relaxed">Upload a clear picture of the face you want to find. This reference will be used to run facial recognition against your target folder.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">4</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Start Scanning</h3>
                <p className="leading-relaxed">Click "Start Scan" and let the Neural Engine do its magic. All processing happens locally in your browser to maintain 100% privacy.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">5</span>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Review Results</h3>
                <p className="leading-relaxed">Browse the matched photos in the gallery. You can open and download your favorite pictures directly from the interface.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
