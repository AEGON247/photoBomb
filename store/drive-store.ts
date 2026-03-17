import { create } from 'zustand';

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    thumbnailLink?: string;
    parents?: string[];
}

interface DriveState {
    currentFolderId: string;
    breadcrumbs: { id: string; name: string }[];
    files: DriveFile[];
    selectedFolder: DriveFile | null;
    loading: boolean;
    setCurrentFolder: (id: string, name?: string) => void;
    setFiles: (files: DriveFile[]) => void;
    setSelectedFolder: (folder: DriveFile | null) => void;
    setLoading: (loading: boolean) => void;
    pushBreadcrumb: (id: string, name: string) => void;
    popBreadcrumb: (id: string) => void; 
    resetBreadcrumbs: () => void;
}

export const useDriveStore = create<DriveState>((set) => ({
    currentFolderId: 'root',
    breadcrumbs: [{ id: 'root', name: 'My Drive' }],
    files: [],
    selectedFolder: null,
    loading: false,
    setCurrentFolder: (id, name) => set((state) => {
        
        
        return { currentFolderId: id };
    }),
    setFiles: (files) => set({ files }),
    setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
    setLoading: (loading) => set({ loading }),
    pushBreadcrumb: (id, name) => set((state) => {
        if (state.breadcrumbs.find(b => b.id === id)) return state;
        return { breadcrumbs: [...state.breadcrumbs, { id, name }] };
    }),
    popBreadcrumb: (id) => set((state) => {
        const index = state.breadcrumbs.findIndex(b => b.id === id);
        if (index === -1) return state;
        return { breadcrumbs: state.breadcrumbs.slice(0, index + 1) };
    }),
    resetBreadcrumbs: () => set({ breadcrumbs: [{ id: 'root', name: 'My Drive' }], currentFolderId: 'root' }),
}));
