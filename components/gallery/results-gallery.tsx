"use client";

import { useScanStore } from "@/store/scan-store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, ExternalLink } from "lucide-react";
import Image from "next/image";

export function ResultsGallery() {
    const { results } = useScanStore();

    if (results.length === 0) return null;

    
    const sorted = [...results].sort((a, b) => b.similarity - a.similarity);

    return (
        <div className="w-full max-w-6xl space-y-6 pt-8">
            <h2 className="font-display font-black uppercase text-3xl text-foreground border-b-[4px] border-foreground pb-2 inline-block">
                Confirmed Positives ({results.length})
            </h2>
            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sorted.map((result) => (
                    <Card key={result.id} className="comic-panel p-0 bg-card overflow-hidden group relative flex flex-col hover:-translate-y-1 hover:-translate-x-1 transition-transform">
                        <div className="aspect-square relative bg-black border-b-[4px] border-foreground">
                            <img
                                src={result.thumbnailLink}
                                alt={result.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                <span className="comic-badge text-xl bg-primary text-foreground scale-110 shadow-[3px_3px_0_0_#000] rotate-[-3deg]">
                                    {(result.similarity * 100).toFixed(0)}% Match
                                </span>
                                <a
                                    href={`https://drive.google.com/file/d/${result.id}/view`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-bold uppercase tracking-widest text-foreground bg-secondary px-3 py-2 border-[2px] border-foreground shadow-[2px_2px_0_0_#000] hover:bg-foreground hover:text-secondary flex items-center gap-2 text-xs mt-6 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" /> Open File
                                </a>
                            </div>
                        </div>
                        <div className="p-3 bg-card border-t-[3px] border-foreground absolute bottom-0 w-full translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-xs font-bold uppercase tracking-widest text-foreground truncate">{result.name}</p>
                        </div>
                    </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
