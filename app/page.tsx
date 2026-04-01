"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2, ArrowRight, ScanFace, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  if (loading || !mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-halftone relative overflow-hidden flex flex-col font-sans">
      
      <header className="w-full px-6 py-5 flex justify-between items-center z-10 border-b-4 border-foreground bg-background">
        <div className="flex items-center gap-3">
          <div className="bg-primary border-2 border-foreground shadow-comic-sm text-foreground p-1.5 translate-y-[-2px]">
            <ScanFace className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-black uppercase tracking-tighter text-foreground">
            PhotoBomb <span className="text-primary" style={{WebkitTextStroke: "1px var(--color-foreground)"}}>AI</span>
          </span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Button
              onClick={() => router.push("/dashboard")}
              variant="default"
              size="sm"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="max-w-4xl w-full flex flex-col items-center space-y-8"
        >
          <div className="comic-badge mb-4 rotate-[-3deg]">
            <div className="w-2 h-2 mr-2 bg-foreground border border-foreground" />
            V1 Beta Edition
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-black text-foreground uppercase leading-[0.9] tracking-tighter text-balance" style={{ textShadow: "6px 6px 0 var(--color-primary)" }}>
            Find your face in <br className="hidden md:block" />
            thousands of photos.
          </h1>

          <div className="comic-panel max-w-2xl mx-auto p-6 md:p-8 mt-4 rotate-[1deg]">
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
              Connect a Google Drive folder, upload a reference selfie, and let our
              Neural Engine instantly locate every picture you're in.
              <br/><br/>
              <span className="font-display font-bold uppercase tracking-wider text-secondary">No cloud-processing. 100% private.</span>
            </p>
          </div>

          <div className="flex justify-center items-center mt-6 w-full max-w-xs md:max-w-none">
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/login")}
              size="lg"
              className="w-full md:w-auto text-xl rotate-[-2deg]"
            >
              {user ? 'Open Workspace' : 'Start Scanning Now'}
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl mx-auto w-full px-4"
        >
          <div className="comic-panel p-8 text-left comic-panel-hover flex flex-col h-full group">
            <div className="bg-primary w-14 h-14 border-4 border-foreground shadow-comic-sm flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
              <Zap className="text-foreground w-7 h-7" />
            </div>
            <h3 className="text-2xl font-display font-black uppercase text-foreground mb-4">Lightning Fast</h3>
            <p className="text-foreground/80 text-lg font-medium leading-relaxed">Powered by WebAssembly and SSD Mobilenet. Scans massive event folders directly in your browser.</p>
          </div>

          <div className="comic-panel p-8 text-left comic-panel-hover flex flex-col h-full group bg-card translate-y-4 md:translate-y-8">
            <div className="bg-accent w-14 h-14 border-4 border-foreground shadow-comic-sm flex items-center justify-center mb-6 group-hover:-rotate-12 transition-transform">
              <Shield className="text-destructive-foreground w-7 h-7" />
            </div>
            <h3 className="text-2xl font-display font-black uppercase text-foreground mb-4 text-balance">100% Private</h3>
            <p className="text-foreground/80 text-lg font-medium leading-relaxed">Your photos never leave your device. The entire Neural Model runs locally in your browser memory.</p>
          </div>

          <div className="comic-panel p-8 text-left comic-panel-hover flex flex-col h-full group">
            <div className="bg-secondary w-14 h-14 border-4 border-foreground shadow-comic-sm flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
              <ScanFace className="text-foreground w-7 h-7" />
            </div>
            <h3 className="text-2xl font-display font-black uppercase text-foreground mb-4">Adaptive AI</h3>
            <p className="text-foreground/80 text-lg font-medium leading-relaxed">The model explicitly learns from your feedback, preventing doppelgängers from ever showing up twice.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
