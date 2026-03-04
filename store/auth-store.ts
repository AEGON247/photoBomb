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

// Initialize auth listener
if (auth) {
    onAuthStateChanged(auth, (user) => {
        useAuthStore.getState().setUser(user);
        if (!user) {
            useAuthStore.getState().setAccessToken(null);
        } else {
            // Note: Getting the access token on refresh might require more logic 
            // if we want to persist it across reloads strictly via Firebase SDK,
            // but often we rely on the initial sign-in or silent refresh.
            // For this MVP, we'll assume the interaction starts with login or we re-acquire on demand if needed.
            // However, onAuthStateChanged doesn't give credentials directly.
            // We might need to force a token refresh if it's missing.
            user.getIdToken().then(() => {
                // This gets the Firebase ID token, not the Google Access Token.
                // To get the Google Access Token again on reload is tricky with just client-side Firebase Auth
                // without storing it. We might need to rely on the user re-authenticating or storing it 
                // (securely?) - but for client-side apps, usually we just keep it in memory state.
                // If the user reloads, they might need to sign in again to grant drive access 
                // OR we use the refresh token if we had a backend.
                // Since this is client-side only PhotoBomb, we will prompt login if token is missing.
            });
        }
    });
}
