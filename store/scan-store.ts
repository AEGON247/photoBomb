import { create } from 'zustand';


interface ScanResult {
    id: string; 
    name: string;
    thumbnailLink: string;
    similarity: number;
    descriptor: Float32Array; 
    imageUrl?: string; 
}

interface ScanState {
    scanning: boolean;
    progress: { total: number; processed: number; matches: number };
    results: ScanResult[];
    queue: string[]; 
    setScanning: (scanning: boolean) => void;
    addResult: (result: ScanResult) => void;
    updateProgress: (processed: number, total?: number) => void;
    resetScan: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
    scanning: false,
    progress: { total: 0, processed: 0, matches: 0 },
    results: [],
    queue: [],
    setScanning: (scanning) => set({ scanning }),
    addResult: (result) => set((state) => ({
        results: [...state.results, result],
        progress: { ...state.progress, matches: state.progress.matches + 1 }
    })),
    updateProgress: (processed, total) => set((state) => ({
        progress: {
            ...state.progress,
            processed: state.progress.processed + processed,
            total: total !== undefined ? total : state.progress.total
        }
    })),
    resetScan: () => set({
        scanning: false,
        progress: { total: 0, processed: 0, matches: 0 },
        results: [],
        queue: []
    }),
}));
