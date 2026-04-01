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

    
    useEffect(() => {
        if (user) {
            loadFeedback();
        }
    }, [user, loadFeedback]);

    return (
        <AuthGuard>
            <div className="min-h-screen bg-halftone text-foreground p-4 md:p-8 font-sans">
                <header className="flex justify-between items-center mb-8 border-b-4 border-foreground pb-4 bg-background p-4 shadow-comic-sm">
                    <div>
                        <h1 className="text-3xl font-display font-black uppercase tracking-tight">Scanner Dashboard</h1>
                        <p className="text-foreground/80 font-bold uppercase tracking-widest text-sm">Operative: {user?.displayName}</p>
                    </div>
                    <Button variant="outline" onClick={logout} className="border-[3px]">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </header>
                <main className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pb-24">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="comic-panel p-6 relative overflow-hidden flex flex-col gap-8">
                            <div className="space-y-4">
                                <h2 className="text-xl font-display font-black uppercase flex items-center gap-3">
                                    <span className="bg-primary text-foreground border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] w-8 h-8 flex items-center justify-center text-lg -rotate-3">1</span>
                                    Target Source
                                </h2>
                                <DriveLinkInput />
                            </div>

                            <div className="h-[4px] w-full bg-foreground my-2" />

                            <div className="space-y-4">
                                <h2 className="text-xl font-display font-black uppercase flex items-center gap-3">
                                    <span className="bg-primary text-foreground border-2 border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] w-8 h-8 flex items-center justify-center text-lg rotate-3">2</span>
                                    Reference Identity
                                </h2>
                                <ReferenceUploader />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="w-full comic-panel min-h-[600px] p-6 lg:p-8">
                            <h2 className="text-3xl font-display font-black uppercase mb-8 border-b-[4px] border-foreground pb-2 inline-block">
                                Neural processing unit
                            </h2>
                            <ScanManager />
                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
