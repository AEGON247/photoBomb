"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { faceApiService } from "@/lib/face-api";
import { useFaceStore } from "@/store/face-store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User, Check, X } from "lucide-react";
import Image from "next/image";

export function ReferenceUploader() {
    const { setReference, referenceImage, clearReference } = useFaceStore();
    const [detecting, setDetecting] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [faces, setFaces] = useState<any[]>([]); // Descriptors/Landmarks
    const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

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

        const face = faces[selectedFaceIndex];
        // We might want to crop the face for the storage reference image
        // For now, just storing the full image URL and the descriptor
        // Ideally we should store the descriptor as a plain array (Float32Array)
        setReference(face.descriptor, preview);
    };

    const reset = () => {
        setPreview(null);
        setFaces([]);
        setSelectedFaceIndex(null);
        clearReference();
    };

    if (referenceImage) {
        return (
            <Card className="w-full max-w-xl mx-auto bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                        <Check className="w-5 h-5" />
                        Reference Face Set
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl shadow-blue-900/20">
                        {/* In a real app we'd crop this to the face. using object-cover for now */}
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                    </div>
                    <Button variant="outline" onClick={reset} className="border-slate-700 text-slate-300 hover:text-white">
                        Change Reference Photo
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-xl mx-auto bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-slate-100">Upload Reference Photo</CardTitle>
            </CardHeader>
            <CardContent>
                {!preview ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-700 hover:border-slate-600"
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-10 h-10 text-slate-500 mb-4" />
                        <p className="text-slate-400 text-center">Drag & drop a photo of the person you want to find, or click to select.</p>
                    </div>
                ) : (
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
                    <Button variant="ghost" onClick={() => setPreview(null)} className="text-slate-400">Cancel</Button>
                    <Button onClick={confirmSelection} disabled={selectedFaceIndex === null} className="bg-blue-600 hover:bg-blue-700">
                        Use This Face
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
