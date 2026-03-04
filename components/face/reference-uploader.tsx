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
    const [faces, setFaces] = useState<any[]>([]); // Descriptors/Landmarks
    const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
    const [mode, setMode] = useState<"camera" | "upload">("camera");
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const MAX_REFERENCES = 3;

    // Start/stop camera when mode changes
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
                        // Ignore AbortError which happens when the play request is interrupted by a new load request
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
                // No faces found
            } else if (detections.length === 1) {
                // Auto select if only one
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

        // Reset preview state so they can add another
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
        <Card className="w-full max-w-xl mx-auto bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100">Choose Reference Face</CardTitle>
                    <div className="inline-flex rounded-full bg-slate-800 p-1 text-xs">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("camera");
                                setPreview(null);
                                setFaces([]);
                                setSelectedFaceIndex(null);
                            }}
                            className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${mode === "camera"
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:text-white"
                                }`}
                        >
                            <Camera className="w-3 h-3" />
                            Live scan
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("upload");
                                setPreview(null);
                                setFaces([]);
                                setSelectedFaceIndex(null);
                            }}
                            className={`px-3 py-1 rounded-full transition-colors ${mode === "upload"
                                ? "bg-blue-600 text-white"
                                : "text-slate-300 hover:text-white"
                                }`}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {mode === "camera" && (
                    <div className={`space-y-4 ${preview ? 'hidden' : 'block'}`}>
                        <div className="relative rounded-lg overflow-hidden bg-black h-72 flex items-center justify-center">
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                            />
                            {/* Gridpoint overlay for scan effect */}
                            <div className="pointer-events-none absolute inset-0">
                                <div className="absolute inset-[15%] border-2 border-blue-500/70 rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.7)]" />
                                <div className="absolute inset-[18%] grid grid-cols-3 grid-rows-3 opacity-40">
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="border border-blue-400/40"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                type="button"
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
                                        // face-api supports HTMLCanvasElement as input; cast to any to keep TS happy.
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
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Camera className="w-4 h-4 mr-2" />
                                Capture face
                            </Button>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                )}
                {!preview && mode === "upload" && (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700 hover:border-slate-600"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 text-slate-500 mb-4" />
                        <p className="text-slate-400 text-center">
                            Drag & drop a photo of the person you want to find, or click to select.
                        </p>
                    </div>
                )}
                {preview && (
                    <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden max-h-[400px] flex items-center justify-center bg-black">
                            {detecting && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                    <span className="ml-2 font-medium text-white">Scanning for faces...</span>
                                </div>
                            )}
                            <img src={preview} alt="Preview" className="max-w-full max-h-full" />

                            {/* Face Overlays */}
                            {!detecting && faces.map((face, index) => {
                                // face.detection.box gives { x, y, width, height } relative to the image natural size
                                // We need to map this to the displayed image size. 
                                // This is tricky without knowing the display size vs natural size ratio.
                                // For simplicity in this MVP, we might display "Face 1, Face 2" buttons below
                                // OR we rely on face-api to draw on a canvas.
                                return null;
                            })}
                        </div>

                        {!detecting && faces.length === 0 && (
                            <div className="text-red-400 text-center flex items-center justify-center gap-2">
                                <X className="w-4 h-4" /> No faces detected. Try another photo.
                            </div>
                        )}

                        {!detecting && faces.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-slate-400 text-center">
                                    {faces.length} face{faces.length > 1 ? 's' : ''} detected.
                                    {faces.length > 1 ? ' Select the one to search for:' : ' Confirm selection:'}
                                </p>
                                <div className="flex justify-center gap-2 flex-wrap">
                                    {faces.map((face, idx) => (
                                        <Button
                                            key={idx}
                                            variant={selectedFaceIndex === idx ? "default" : "outline"}
                                            className={selectedFaceIndex === idx ? "bg-blue-600" : "border-slate-700"}
                                            onClick={() => setSelectedFaceIndex(idx)}
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Face {idx + 1}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
            {preview && !detecting && faces.length > 0 && (
                <CardFooter className="flex justify-between border-t border-slate-800 pt-4">
                    <Button variant="ghost" onClick={resetPreview} className="text-slate-400">Cancel</Button>
                    <Button onClick={confirmSelection} disabled={selectedFaceIndex === null} className="bg-blue-600 hover:bg-blue-700">
                        Use This Face
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
