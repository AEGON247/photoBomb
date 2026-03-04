import { create } from 'zustand';

export interface FaceReference {
    descriptor: Float32Array;
    image: string; // URL or Base64
}

interface FaceState {
    references: FaceReference[];
    addReference: (descriptor: Float32Array, image: string) => void;
    removeReference: (index: number) => void;
    clearReferences: () => void;
}

export const useFaceStore = create<FaceState>((set) => ({
    references: [],
    addReference: (descriptor, image) => set((state) => ({
        references: [...state.references, { descriptor, image }]
    })),
    removeReference: (index) => set((state) => ({
        references: state.references.filter((_, i) => i !== index)
    })),
    clearReferences: () => set({ references: [] }),
}));
