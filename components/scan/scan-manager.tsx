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
        if (references.length === 0) return;

        try {
            
            const blob = await getFileContent(file.id);
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
                const { files } = await listChildren(folderId);

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
        <Card className="w-full max-w-4xl bg-card border-none shadow-none comic-panel p-0">
            <CardHeader className="border-b-[4px] border-foreground pb-4 bg-background">
                <CardTitle className="flex justify-between items-center text-xl md:text-2xl font-display font-black uppercase">
                    <span>Scanner Log</span>
                    <span className="text-sm md:text-xs font-bold tracking-widest text-foreground/70">{currentStatus}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                    
                    <div className="flex-1 space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold uppercase tracking-widest">
                                <span>Progress</span>
                                <span>{progress.processed} / {progress.total || "?"}</span>
                            </div>
                            <Progress value={progress.total ? (progress.processed / progress.total) * 100 : 0} />
                        </div>

                        <div className="flex gap-4 justify-center">
                            {!scanning ? (
                                <Button onClick={startScan} size="lg" className="w-40 text-lg">
                                    <Play className="mr-2 w-6 h-6" /> Start
                                </Button>
                            ) : (
                                <Button onClick={stopScan} variant="destructive" size="lg" className="w-40 text-lg">
                                    <Square className="mr-2 w-6 h-6" /> Stop
                                </Button>
                            )}
                        </div>

                        {results.length > 0 && (
                            <div className="pt-8 border-t-[4px] border-foreground mt-8">
                                <h3 className="text-center font-display font-black uppercase text-3xl mb-8">
                                    Operation Results: {results.length} Matches
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
                                    {results.map((result, idx) => (
                                        <div key={idx} className="relative group border-[3px] border-foreground bg-card shadow-comic-sm flex flex-col hover:-translate-y-1 hover:-translate-x-1 hover:shadow-comic transition-all">
                                            
                                            <a
                                                href={`https://drive.google.com/file/d/${result.id}/view`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="aspect-[3/4] relative block cursor-pointer bg-black overflow-hidden border-b-[3px] border-foreground"
                                            >
                                                <img
                                                    src={result.imageUrl || result.thumbnailLink}
                                                    alt={result.name}
                                                    className="w-full h-full object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
                                                    <span className="comic-badge text-lg bg-primary text-foreground scale-110 shadow-[2px_2px_0_0_#000]">
                                                        {Math.round(result.similarity * 100)}% Match
                                                    </span>
                                                </div>
                                            </a>

                                            <div className="p-3 bg-card">
                                                <div className="flex gap-2 w-full justify-between">
                                                    <Button
                                                        size="sm"
                                                        disabled={!!feedbackState[result.id]}
                                                        className={`flex-1 rounded-none border-[2px] border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-all ${feedbackState[result.id] === 'correct' ? 'bg-primary text-foreground' : 'bg-background hover:bg-primary/20 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none min-w-0 px-0'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            useFeedbackStore.getState().addTruePositive(result.descriptor, result.id, result.similarity);
                                                            setFeedbackState(prev => ({ ...prev, [result.id]: 'correct' }));
                                                        }}
                                                        title="Correct Match"
                                                    >
                                                        <Check className={`h-5 w-5 ${feedbackState[result.id] === 'correct' ? 'text-foreground' : 'text-primary'}`} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={!!feedbackState[result.id]}
                                                        className={`flex-1 rounded-none border-[2px] border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] transition-all ${feedbackState[result.id] === 'incorrect' ? 'bg-destructive text-white' : 'bg-background hover:bg-destructive/20 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none min-w-0 px-0'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            useFeedbackStore.getState().addFalsePositive(result.descriptor, result.id, result.similarity);
                                                            setFeedbackState(prev => ({ ...prev, [result.id]: 'incorrect' }));
                                                        }}
                                                        title="Incorrect Match"
                                                    >
                                                        <X className={`h-5 w-5 ${feedbackState[result.id] === 'incorrect' ? 'text-white' : 'text-destructive'}`} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="md:w-32 shrink-0 border-t-[4px] md:border-t-0 md:border-l-[4px] border-foreground pt-6 md:pt-0 md:pl-6 flex flex-col items-center">
                        <p className="text-sm font-bold uppercase tracking-widest mb-6 text-center">References</p>
                        <div className="flex flex-row md:flex-col gap-4 overflow-y-auto max-h-[400px] w-full items-center custom-scrollbar pb-2 md:pb-0 px-2 pt-2">
                            {references.map((ref, idx) => (
                                <div key={idx} className={`relative shrink-0 w-20 h-20 border-[3px] border-foreground shadow-[3px_3px_0_0_var(--color-foreground)] ${idx % 2 === 0 ? '-rotate-3' : 'rotate-3'} hover:rotate-0 transition-transform`}>
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
