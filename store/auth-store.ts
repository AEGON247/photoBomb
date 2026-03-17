import { create } from 'zustand';
import { User, onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    accessToken: string | null;
    signIn: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    accessToken: null,
    signIn: async () => {
        if (!auth) return;
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken || null;
            set({ user: result.user, accessToken: token });
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    },
    logout: async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            set({ user: null, accessToken: null });
        } catch (error) {
            console.error("Error signing out", error);
        }
    },
    setUser: (user) => set({ user, loading: false }),
    setAccessToken: (token) => set({ accessToken: token }),
}));


if (auth) {
    onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setUser(user);
        if (!user) {
            useAuthStore.getState().setAccessToken(null);
        } else {
            
            
            
            
            
            
            user.getIdToken().then(() => {
                
                
                
                
                
                
                
            });
        }
    });
}
