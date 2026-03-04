"use client";

import { useEffect } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { useFeedbackStore } from "@/store/feedback-store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DriveLinkInput } from "@/components/drive/drive-link-input";
import { ReferenceUploader } from "@/components/face/reference-uploader";
import { ScanManager } from "@/components/scan/scan-manager";
import { ResultsGallery } from "@/components/gallery/results-gallery";

export default function DashboardPage() {
    const { logout, user } = useAuthStore();
    const { loadFeedback } = useFeedbackStore();

    // Load user's custom AI feedback data on mount
    useEffect(() => {
        if (user) {
            loadFeedback();
        }
    }, [user, loadFeedback]);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
                <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <p className="text-slate-400">Welcome, {user?.displayName}</p>
                    </div>
                    <Button variant="outline" onClick={logout} className="border-slate-700 hover:bg-slate-800">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </header>
                <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pb-24">

                    {/* Left Column: Control Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />

                            <div className="space-y-8 relative z-10">
                                {/* Step 1: Folder Selection */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                        Target Folder
                                    </h2>
                                    <DriveLinkInput />
                                </div>

                                <div className="h-px w-full bg-border" />

                                {/* Step 2: Face Reference */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                        Reference Face
                                    </h2>
                                    <ReferenceUploader />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Execution & Canvas */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* 
                            Note: ScanManager currently holds both the Start button AND the gallery.
                            For now, placing it here makes it act as the "Canvas".
                            I've set its width to full so it expands naturally into the large right column. 
                        */}
                        <div className="w-full bg-card border border-border rounded-xl shadow-xl min-h-[600px] p-6 lg:p-8">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-400 mb-6">
                                Neural Interface
                            </h2>
                            <ScanManager />
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
