import { create } from 'zustand';

interface FaceState {
    referenceDescriptor: Float32Array | null;
    referenceImage: string | null; // URL or Base64
    setReference: (descriptor: Float32Array, image: string) => void;
    clearReference: () => void;
}

export const useFaceStore = create<FaceState>((set) => ({
    referenceDescriptor: null,
    referenceImage: null,
    setReference: (descriptor, image) => set({ referenceDescriptor: descriptor, referenceImage: image }),
    clearReference: () => set({ referenceDescriptor: null, referenceImage: null }),
}));
