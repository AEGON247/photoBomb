"use client";

import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useDriveStore } from "@/store/drive-store";
import { useFaceStore } from "@/store/face-store";
import { useScanStore } from "@/store/scan-store";
import { listChildren, getFileContent, DriveFile } from "@/lib/drive-service";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, Square } from "lucide-react";
import { euclideanDistance, faceApiService } from "@/lib/face-api";

export function ScanManager() {
    const { accessToken } = useAuthStore();
    const { selectedFolder } = useDriveStore();
    const { referenceDescriptor } = useFaceStore();
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

    const processFile = async (file: DriveFile) => {
        if (!accessToken || !referenceDescriptor) return;

        try {
            // Get content (blob) and create an image we can run face-api.js on
            const blob = await getFileContent(accessToken, file.id);
            const imageUrl = URL.createObjectURL(blob);
            const imgElement = await faceApiService.createImage(imageUrl);
            URL.revokeObjectURL(imageUrl); // Cleanup the object URL

            // Run face detection + descriptor extraction on the image
            const detection = await faceApiService.detectFace(imgElement);
            const descriptor = detection?.descriptor as Float32Array | undefined;

            if (descriptor) {
                const distance = euclideanDistance(referenceDescriptor, descriptor);
                if (distance < 0.6) { // Threshold
                    addResult({
                        id: file.id,
                        name: file.name,
                        thumbnailLink: file.thumbnailLink || "",
                        similarity: 1 - distance
                    });
                }
            }
        } catch (error) {
            console.error(`Error processing file ${file.name}`, error);
        } finally {
            updateProgress(1); // Increment processed
        }
    };

    const startScan = async () => {
        if (!accessToken) {
            setCurrentStatus("Please sign in with Google on the login page first.");
            return;
        }
        if (!selectedFolder) {
            setCurrentStatus("Paste a valid Google Drive folder link above before starting the scan.");
            return;
        }
        if (!referenceDescriptor) {
            setCurrentStatus("Upload and confirm a reference face photo before starting the scan.");
            return;
        }

        setScanning(true);
        resetScan();
        setCurrentStatus(`Scanning “${selectedFolder.name}” and its subfolders...`);

        const folderQueue = [selectedFolder.id];
        while (folderQueue.length > 0 && useScanStore.getState().scanning) {
            const folderId = folderQueue.shift();
            if (!folderId) continue;

            try {
                const { files } = await listChildren(accessToken, folderId);

                const imageFiles = files.filter((f: any) => f.mimeType?.startsWith("image/"));
                const subFolders = files.filter((f: any) => f.mimeType === "application/vnd.google-apps.folder");

                // Add subfolders to queue
                folderQueue.push(...subFolders.map((f: any) => f.id));

                // Update total
                updateProgress(0, (useScanStore.getState().progress.total || 0) + imageFiles.length);

                // Process images in parallel (with limit)
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

    if (!selectedFolder || !referenceDescriptor) return null;

    return (
        <Card className="w-full max-w-3xl border-slate-800 bg-slate-900 text-slate-100">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Scanning Process</span>
                    <span className="text-sm font-normal text-slate-400">{currentStatus}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        {/* We could show a preview of recent matches here */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
