"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDriveStore } from "@/store/drive-store";
import { useFaceStore } from "@/store/face-store";
import { useScanStore } from "@/store/scan-store";
import { useFeedbackStore } from "@/store/feedback-store";
import { listChildren, getFileContent, DriveFile } from "@/lib/drive-service";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Square, Check, X } from "lucide-react";
import { euclideanDistance, faceApiService } from "@/lib/face-api";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export function ScanManager() {
    const router = useRouter();
    const { accessToken } = useAuthStore();
    const { selectedFolder } = useDriveStore();
    const { references } = useFaceStore();
    const { truePositives, falsePositives } = useFeedbackStore();
    const {
        scanning,
        setScanning,
        progress,
        addResult,
        updateProgress,
        resetScan,
        results
    } = useScanStore();

    const [currentStatus, setCurrentStatus] = useState<string>("Paste a folder link and upload a reference face to begin.");
    const [feedbackState, setFeedbackState] = useState<Record<string, 'correct' | 'incorrect'>>({});

    const processFile = async (file: DriveFile) => {
        if (!accessToken || references.length === 0) return;

        try {
            
            const blob = await getFileContent(accessToken, file.id);
            const imageUrl = URL.createObjectURL(blob);
            const imgElement = await faceApiService.createImage(imageUrl);

            
            const detections = await faceApiService.detectAllFaces(imgElement);

            let bestMatchDistance = 1.0;
            let bestDescriptor: Float32Array | null = null;
            let finalSimilarity = 0;
            let isAccepted = false;

            for (const detection of detections) {
                const descriptor = detection.descriptor;
                if (descriptor) {
                    
                    let distToTarget = 1.0;
                    for (const ref of references) {
                        const dist = euclideanDistance(ref.descriptor, descriptor);
                        if (dist < distToTarget) distToTarget = dist;
                    }
                    for (const tp of truePositives) {
                        const dist = euclideanDistance(tp, descriptor);
                        if (dist < distToTarget) distToTarget = dist;
                    }

                    
                    let distToFalsePositive = 1.0;
                    for (const fp of falsePositives) {
                        const dist = euclideanDistance(fp, descriptor);
                        if (dist < distToFalsePositive) distToFalsePositive = dist;
                    }

                    
                    let matched = false;
                    
                    if (distToFalsePositive < distToTarget && distToFalsePositive < 0.55) {
                        matched = false;
                    }
                    
                    else if (distToTarget < 0.53) {
                        matched = true;
                    }

                    
                    if (matched && distToTarget < bestMatchDistance) {
                        bestMatchDistance = distToTarget;
                        
                        const mappedScore = 1.0 - ((distToTarget - 0.3) / (0.55 - 0.3)) * 0.25;
                        finalSimilarity = Math.min(0.99, Math.max(0.1, mappedScore));
                        bestDescriptor = descriptor;
                        isAccepted = true;
                    }
                }
            }

            if (isAccepted && bestDescriptor) {
                addResult({
                    id: file.id,
                    name: file.name,
                    thumbnailLink: file.thumbnailLink || "",
                    similarity: finalSimilarity,
                    descriptor: bestDescriptor,
                    imageUrl: imageUrl
                });
            } else {
                URL.revokeObjectURL(imageUrl); 
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}`, error);
        } finally {
            updateProgress(1); 
        }
    };

    const startScan = async () => {
        if (!accessToken) {
            router.push("/login");
            return;
        }
        if (!selectedFolder) {
            setCurrentStatus("Paste a valid Google Drive folder link above before starting the scan.");
            return;
        }
        if (references.length === 0) {
            setCurrentStatus("Upload and confirm at least one reference face photo before starting the scan.");
            return;
        }

        resetScan();
        setScanning(true);
        setCurrentStatus(`Scanning “${selectedFolder.name}” and its subfolders...`);

        const folderQueue = [selectedFolder.id];
        while (folderQueue.length > 0 && useScanStore.getState().scanning) {
            const folderId = folderQueue.shift();
            if (!folderId) continue;

            try {
                const { files } = await listChildren(accessToken, folderId);

                const imageFiles = files.filter((f: any) => f.mimeType?.startsWith("image/"));
                const subFolders = files.filter((f: any) => f.mimeType === "application/vnd.google-apps.folder");

                
                folderQueue.push(...subFolders.map((f: any) => f.id));

                
                updateProgress(0, (useScanStore.getState().progress.total || 0) + imageFiles.length);

                
                const CONCURRENCY = 4;
                for (let i = 0; i < imageFiles.length; i += CONCURRENCY) {
                    if (!useScanStore.getState().scanning) break;

                    const batch = imageFiles.slice(i, i + CONCURRENCY);
                    await Promise.all(batch.map((f: any) => processFile(f)));
                }

            } catch (error) {
                console.error("Error listing folder", error);
            }
        }

        setScanning(false);
        setCurrentStatus("Scan complete.");
    };

    const stopScan = () => {
        setScanning(false);
        setCurrentStatus("Scan stopped.");
    };

    if (!selectedFolder || references.length === 0) return null;

    return (
        <Card className="w-full max-w-4xl border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Scanning Process</span>
                    <span className="text-sm font-normal text-slate-400">{currentStatus}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                    
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{progress.processed} / {progress.total || "?"}</span>
                            </div>
                            <Progress value={progress.total ? (progress.processed / progress.total) * 100 : 0} className="h-2" />
                        </div>

                        <div className="flex gap-4 justify-center">
                            {!scanning ? (
                                <Button onClick={startScan} className="bg-green-600 hover:bg-green-700 w-32">
                                    <Play className="mr-2 w-4 h-4" /> Start
                                </Button>
                            ) : (
                                <Button onClick={stopScan} variant="destructive" className="w-32">
                                    <Square className="mr-2 w-4 h-4" /> Stop
                                </Button>
                            )}
                        </div>

                        {results.length > 0 && (
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-center text-blue-400 font-bold text-lg mb-4">
                                    Found {results.length} Matches!
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex flex-col hover:border-slate-500 transition-colors">
                                            
                                            <a
                                                href={`https://drive.google.com/file/d/${result.id}/view`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="aspect-[3/4] relative block cursor-pointer bg-black overflow-hidden"
                                            >
                                                
                                                <img
                                                    src={result.imageUrl || result.thumbnailLink}
                                                    alt={result.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    referrerPolicy="no-referrer"
                                                />
                                                
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <span className="text-green-400 font-bold text-xl drop-shadow-md bg-slate-900/50 px-4 py-2 flex items-center justify-center text-center rounded-full border border-green-500/30">
                                                        {Math.round(result.similarity * 100)}% Match
                                                    </span>
                                                </div>
                                            </a>

                                            
                                            <div className="p-2 flex flex-col items-center justify-between gap-1 bg-slate-800">
                                                <div className="flex gap-4 w-full justify-center pb-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={!!feedbackState[result.id]}
                                                        className={`h-10 w-10 p-0 rounded-full transition-colors ${feedbackState[result.id] === 'correct' ? 'bg-green-600 text-white hover:bg-green-700' : 'text-green-500 hover:bg-green-500/20 hover:text-green-400'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            useFeedbackStore.getState().addTruePositive(result.descriptor, result.id, result.similarity);
                                                            setFeedbackState(prev => ({ ...prev, [result.id]: 'correct' }));
                                                        }}
                                                        title="Mark as Correct (Improve AI)"
                                                    >
                                                        <Check className="h-6 w-6" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        disabled={!!feedbackState[result.id]}
                                                        className={`h-10 w-10 p-0 rounded-full transition-colors ${feedbackState[result.id] === 'incorrect' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-500 hover:bg-red-500/20 hover:text-red-400'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            useFeedbackStore.getState().addFalsePositive(result.descriptor, result.id, result.similarity);
                                                            setFeedbackState(prev => ({ ...prev, [result.id]: 'incorrect' }));
                                                        }}
                                                        title="Mark as Incorrect (Improve AI)"
                                                    >
                                                        <X className="h-6 w-6" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    
                    <div className="md:w-32 shrink-0 border-l border-slate-800 pl-6 flex flex-col items-center">
                        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4 text-center">References ({references.length})</p>
                        <div className="flex flex-row md:flex-col gap-3 overflow-y-auto max-h-[300px] w-full items-center custom-scrollbar pb-2 md:pb-0 px-1">
                            {references.map((ref, idx) => (
                                <div key={idx} className="relative group shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border border-slate-600 shadow-md">
                                    <img src={ref.image} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
