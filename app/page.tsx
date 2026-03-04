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

  // If still authenticating on initial load, show sleek loader
  if (loading || !mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Minimal Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navbar */}
      <header className="w-full px-8 py-6 flex justify-between items-center z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-sm shadow-md">
            <ScanFace className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            PhotoBomb <span className="text-primary font-semibold">AI</span>
          </span>
        </div>
        <div className="flex gap-4">
          {user ? (
            <Button
              onClick={() => router.push("/dashboard")}
              variant="default"
              className="rounded-sm px-6 shadow-sm"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              variant="secondary"
              className="bg-white text-black hover:bg-slate-100 rounded-sm px-6 shadow-sm font-medium transition-all"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-border bg-card text-muted-foreground text-sm font-medium shadow-sm mb-4">
            <div className="w-1.5 h-1.5 rounded-none bg-primary" />
            V1 Beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground mb-6 drop-shadow-sm">
            Find your face in <br className="hidden md:block" />
            thousands of photos.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect a Google Drive folder, upload a reference selfie, and let our
            Neural Engine instantly locate every picture you're in.
            No cloud-processing. 100% private.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/login")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-sm px-8 h-12 text-lg group w-full sm:w-auto shadow-md transition-all"
            >
              {user ? 'Open Workspace' : 'Get Started'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto w-full px-4"
        >
          <div className="bg-card border border-border p-6 rounded-sm shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="bg-muted w-10 h-10 rounded-sm flex items-center justify-center mb-5 border border-border">
              <Zap className="text-foreground w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Powered by WebAssembly and SSD Mobilenet. Scans massive event folders directly in your browser.</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-sm shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="bg-muted w-10 h-10 rounded-sm flex items-center justify-center mb-5 border border-border">
              <Shield className="text-foreground w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">100% Private</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Your photos never leave your device. The entire Neural Model runs locally in your browser memory.</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-sm shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="bg-muted w-10 h-10 rounded-sm flex items-center justify-center mb-5 border border-border">
              <ScanFace className="text-foreground w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Adaptive AI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">The model explicitly learns from your feedback, preventing doppelgängers from ever showing up twice.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
