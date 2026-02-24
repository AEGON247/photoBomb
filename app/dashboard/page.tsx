"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { DriveLinkInput } from "@/components/drive/drive-link-input";
import { ReferenceUploader } from "@/components/face/reference-uploader";
import { ScanManager } from "@/components/scan/scan-manager";
import { ResultsGallery } from "@/components/gallery/results-gallery";

export default function DashboardPage() {
    const { logout, user } = useAuthStore();

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
                <main className="flex flex-col items-center justify-center space-y-8 mt-12 pb-24">
                    {/* Step 1: Folder Selection */}
                    <div className="w-full max-w-3xl space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-400">
                                1. Paste Google Drive folder link
                            </h2>
                        </div>
                        <DriveLinkInput />
                    </div>

                    {/* Step 2: Face Reference */}
                    <div className="w-full max-w-3xl space-y-4">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
                                2. Upload Reference Face
                            </h2>
                        </div>
                        <ReferenceUploader />
                    </div>

                    {/* Step 3: Start Button */}
                    <div className="w-full max-w-3xl">
                        <ScanManager />
                    </div>

                    {/* Step 4: Results */}
                    <div className="w-full max-w-3xl">
                        <ResultsGallery />
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
