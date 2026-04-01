"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { faceApiService } from "@/lib/face-api";
import { useFaceStore } from "@/store/face-store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User, Check, X, Camera, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export function ReferenceUploader() {
    const { references, addReference, removeReference, clearReferences } = useFaceStore();
    const [detecting, setDetecting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [faces, setFaces] = useState<any[]>([]); 
    const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<"camera" | "upload">("camera");
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const MAX_REFERENCES = 3;

    
    useEffect(() => {
        let currentStream: MediaStream | null = null;
        let isActive = true;

        const startCamera = async () => {
            if (!navigator.mediaDevices?.getUserMedia) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                    audio: false,
                });

                if (!isActive) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                currentStream = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    try {
                        await videoRef.current.play();
                    } catch (playError: any) {
                        
                        if (playError.name !== 'AbortError') {
                            console.error("Error playing video:", playError);
                        }
                    }
                }
            } catch (err) {
                console.error("Could not access camera", err);
                if (isActive) setMode("upload");
            }
        };

        const stopCamera = () => {
            if (currentStream) {
                currentStream.getTracks().forEach((t) => t.stop());
                currentStream = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };

        if (mode === "camera") {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            isActive = false;
            stopCamera();
        };
    }, [mode]);

    const onDrop = async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        const url = URL.createObjectURL(file);
        setPreview(url);
        setDetecting(true);
        setFaces([]);
        setSelectedFaceIndex(null);

        try {
            const img = await faceApiService.createImage(url);
            const detections = await faceApiService.detectAllFaces(img);
            setFaces(detections);

            if (detections.length === 0) {
                
            } else if (detections.length === 1) {
                
                setSelectedFaceIndex(0);
            }
        } catch (error) {
            console.error("Detection failed", error);
        } finally {
            setDetecting(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const confirmSelection = () => {
        if (selectedFaceIndex === null || !faces[selectedFaceIndex] || !preview) return;
        if (references.length >= MAX_REFERENCES) return;

        const face = faces[selectedFaceIndex];
        addReference(face.descriptor, preview);

        
        setPreview(null);
        setFaces([]);
        setSelectedFaceIndex(null);
    };

    const resetPreview = () => {
        setPreview(null);
        setFaces([]);
        setSelectedFaceIndex(null);
    };

    const resetAll = () => {
        resetPreview();
        clearReferences();
    };

    return (
        <Card className="w-full max-w-xl mx-auto comic-panel bg-card">
            <CardHeader className="border-b-[4px] border-foreground bg-background pb-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <CardTitle className="font-display font-black uppercase text-xl text-foreground">Identify Target</CardTitle>
                    <div className="inline-flex border-[3px] border-foreground bg-background p-1 text-xs font-bold uppercase tracking-widest shadow-[2px_2px_0_0_var(--color-foreground)]">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("camera");
                                setPreview(null);
                                setFaces([]);
                                setSelectedFaceIndex(null);
                            }}
                            className={`px-4 py-1.5 transition-all flex items-center gap-2 ${mode === "camera"
                                ? "bg-primary text-foreground border-[2px] border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] -translate-y-[1px]"
                                : "text-foreground/70 hover:text-foreground"
                                }`}
                        >
                            <Camera className="w-4 h-4" />
                            Scanner
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("upload");
                                setPreview(null);
                                setFaces([]);
                                setSelectedFaceIndex(null);
                            }}
                            className={`px-4 py-1.5 transition-all flex items-center gap-2 ${mode === "upload"
                                ? "bg-primary text-foreground border-[2px] border-foreground shadow-[2px_2px_0_0_var(--color-foreground)] -translate-y-[1px]"
                                : "text-foreground/70 hover:text-foreground"
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {mode === "camera" && (
                    <div className={`space-y-6 ${preview ? 'hidden' : 'block'}`}>
                        <div className="relative border-[4px] border-foreground shadow-[8px_8px_0_0_var(--color-foreground)] bg-black h-72 flex items-center justify-center -rotate-1">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                            />
                            
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-[15%] border-[4px] border-primary" />
                                <div className="absolute inset-[18%] grid grid-cols-3 grid-rows-3 opacity-40">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border-2 border-primary/50"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-2">
                            <Button
                                type="button"
                                size="lg"
                                onClick={async () => {
                                    if (!videoRef.current) return;
                                    const video = videoRef.current;
                                    const canvas = canvasRef.current;
                                    if (!canvas) return;

                                    const width = video.videoWidth || 640;
                                    const height = video.videoHeight || 480;
                                    canvas.width = width;
                                    canvas.height = height;

                                    const ctx = canvas.getContext("2d");
                                    if (!ctx) return;
                                    ctx.drawImage(video, 0, 0, width, height);

                                    const dataUrl = canvas.toDataURL("image/png");
                                    setPreview(dataUrl);
                                    setDetecting(true);
                                    setFaces([]);
                                    setSelectedFaceIndex(null);

                                    try {
                                        const detections = await faceApiService.detectAllFaces(canvas as any);
                                        setFaces(detections || []);
                                        if (detections && detections.length === 1) {
                                            setSelectedFaceIndex(0);
                                        }
                                    } catch (err) {
                                        console.error("Camera detection failed", err);
                                    } finally {
                                        setDetecting(false);
                                    }
                                }}
                                className="rotate-2"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Capture Target
                            </Button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}
                {!preview && mode === "upload" && (
                    <div
                        {...getRootProps()}
                        className={`border-[4px] border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${isDragActive
                            ? "border-foreground bg-primary/20 shadow-comic"
                            : "border-foreground bg-background hover:bg-primary/5 shadow-comic-sm"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-12 h-12 text-foreground mb-4" />
                        <p className="text-foreground font-bold uppercase tracking-wider text-center max-w-xs">
                            Drop a photo of the target or click here
                        </p>
                    </div>
                )}
                {preview && (
                    <div className="space-y-6">
                        <div className="relative border-[4px] border-foreground shadow-[8px_8px_0_0_var(--color-primary)] overflow-hidden max-h-[400px] flex items-center justify-center bg-black rotate-1">
                            {detecting && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10 space-y-4">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                    <span className="font-display font-black uppercase tracking-widest text-foreground text-xl">Analyzing...</span>
                                </div>
                            )}
                            <img src={preview as string} alt="Preview" className="max-w-full max-h-full" />
                        </div>

                        {!detecting && faces.length === 0 && (
                            <div className="border-[3px] border-destructive bg-destructive/10 p-4 text-center flex items-center justify-center gap-2 text-destructive font-bold uppercase tracking-wider shadow-comic-sm mt-4">
                                <X className="w-5 h-5" /> Target not found. Scan again.
                            </div>
                        )}

                        {!detecting && faces.length > 0 && (
                            <div className="space-y-4 bg-background border-[3px] border-foreground p-4 shadow-comic-sm">
                                <p className="font-display font-black uppercase text-center text-foreground">
                                    {faces.length} Identity Signature{faces.length > 1 ? 's' : ''} detected.
                                    {faces.length > 1 ? ' Select Target:' : ' Confirm Target:'}
                                </p>
                                <div className="flex justify-center gap-3 flex-wrap">
                                    {faces.map((face, idx) => (
                                        <Button
                                            key={idx}
                                            variant={selectedFaceIndex === idx ? "default" : "outline"}
                                            onClick={() => setSelectedFaceIndex(idx)}
                                            className={selectedFaceIndex === idx ? "-translate-y-1 shadow-comic-sm" : ""}
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Identity {idx + 1}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            {preview && !detecting && faces.length > 0 && (
                <CardFooter className="flex justify-between border-t-[4px] border-foreground pt-4 bg-background">
                    <Button variant="ghost" onClick={resetPreview} className="font-bold uppercase tracking-widest">Cancel</Button>
                    <Button onClick={confirmSelection} disabled={selectedFaceIndex === null} size="lg">
                        Confirm Target
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
