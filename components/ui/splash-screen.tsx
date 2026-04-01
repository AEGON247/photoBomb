"use client";

import { useState, useEffect } from "react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mobile browsers often severely restrict autoplaying videos, leading to a stuck black screen. 
    // If the screen is mobile-sized, skip the splash immediately.
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowSplash(false);
    }
    
    // Safety fallback: if video is blocked, loading fails, or autoplay is disabled, 
    // ensure the app shows up eventually.
    const failSafe = setTimeout(() => setShowSplash(false), 8000);
    return () => clearTimeout(failSafe);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 sm:p-12 hidden md:flex">
        <video 
          src="/SplashScreen.mp4" 
          autoPlay 
          muted 
          playsInline
          onEnded={() => setShowSplash(false)}
          onError={() => setShowSplash(false)}
          className="w-full max-w-3xl h-auto max-h-[80vh] object-contain pointer-events-none"
        />
      </div>
    );
  }

  return <>{children}</>;
}
