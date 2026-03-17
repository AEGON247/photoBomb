import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';


interface FeedbackState {
    truePositives: Float32Array[];
    falsePositives: Float32Array[];

    addTruePositive: (descriptor: Float32Array, imageId: string, similarity: number) => Promise<void>;
    addFalsePositive: (descriptor: Float32Array, imageId: string, similarity: number) => Promise<void>;

    
    loadFeedback: () => Promise<void>;
    clearFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
    truePositives: [],
    falsePositives: [],

    addTruePositive: async (descriptor, imageId, similarity) => {
        set((state) => ({ truePositives: [...state.truePositives, descriptor] }));

        
        if (auth.currentUser) {
            try {
                await addDoc(collection(db, "face_feedback"), {
                    userId: auth.currentUser.uid,
                    descriptor: Array.from(descriptor),
                    imageId,
                    similarity,
                    isMatch: true,
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving true positive feedback", error);
            }
        }
    },

    addFalsePositive: async (descriptor, imageId, similarity) => {
        set((state) => ({ falsePositives: [...state.falsePositives, descriptor] }));

        
        if (auth.currentUser) {
            try {
                await addDoc(collection(db, "face_feedback"), {
                    userId: auth.currentUser.uid,
                    descriptor: Array.from(descriptor),
                    imageId,
                    similarity,
                    isMatch: false,
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving false positive feedback", error);
            }
        }
    },

    loadFeedback: async () => {
        if (!auth.currentUser) return;

        try {
            const q = query(
                collection(db, "face_feedback"),
                where("userId", "==", auth.currentUser.uid)
            );

            const querySnapshot = await getDocs(q);

            const truePos: Float32Array[] = [];
            const falsePos: Float32Array[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.descriptor && Array.isArray(data.descriptor)) {
                    const typedArray = new Float32Array(data.descriptor);
                    if (data.isMatch) {
                        truePos.push(typedArray);
                    } else {
                        falsePos.push(typedArray);
                    }
                }
            });

            set({ truePositives: truePos, falsePositives: falsePos });
        } catch (error) {
            console.error("Error loading feedback from Firestore", error);
        }
    },

    clearFeedback: () => set({
        truePositives: [],
        falsePositives: []
    })
}));
