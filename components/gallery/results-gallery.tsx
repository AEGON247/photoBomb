"use client";

import { useScanStore } from "@/store/scan-store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink } from "lucide-react";
import Image from "next/image";

export function ResultsGallery() {
    const { results } = useScanStore();

    if (results.length === 0) return null;

    // Show best matches first
    const sorted = [...results].sort((a, b) => b.similarity - a.similarity);

    return (
        <div className="w-full max-w-6xl space-y-4">
            <h2 className="text-2xl font-bold text-slate-100">
                Matches Found ({results.length})
            </h2>
            <div className="max-h-[600px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sorted.map((result) => (
                    <Card key={result.id} className="bg-slate-900 border-slate-800 overflow-hidden group relative">
                        <div className="aspect-square relative bg-black">
                            {/* We use specific logic for thumbnail. If thumbnailLink is missing, proper fallback needed. */}
                            {/* Note: next/image requires domain config. Using standard img for external dynamic domains */}
                            <img
                                src={result.thumbnailLink}
                                alt={result.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <span className="text-green-400 font-bold text-lg">
                                    {(result.similarity * 100).toFixed(0)}% Match
                                </span>
                                <a
                                    href={`https://drive.google.com/file/d/${result.id}/view`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white hover:text-blue-400 flex items-center gap-1 text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" /> View in Drive
                                </a>
                            </div>
                        </div>
                        <div className="p-2 bg-slate-900 border-t border-slate-800 absolute bottom-0 w-full translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-xs text-slate-400 truncate">{result.name}</p>
                        </div>
                    </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
