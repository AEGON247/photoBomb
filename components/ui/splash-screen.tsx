"use client";

import { useState } from "react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <video 
          src="/SplashScreen.mp4" 
          autoPlay 
          muted 
          playsInline
          onEnded={() => setShowSplash(false)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return <>{children}</>;
}
