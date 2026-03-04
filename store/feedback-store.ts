import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// Store the 128-float descriptors of faces the user explicitly marked as Correct or Incorrect
interface FeedbackState {
    truePositives: Float32Array[];
    falsePositives: Float32Array[];

    addTruePositive: (descriptor: Float32Array) => Promise<void>;
    addFalsePositive: (descriptor: Float32Array) => Promise<void>;

    // For bulk-loading from Firestore on login
    loadFeedback: () => Promise<void>;
    clearFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
    truePositives: [],
    falsePositives: [],

    addTruePositive: async (descriptor) => {
        set((state) => ({ truePositives: [...state.truePositives, descriptor] }));

        // Push to Firestore
        if (auth.currentUser) {
            try {
                await addDoc(collection(db, "face_feedback"), {
                    userId: auth.currentUser.uid,
                    descriptor: Array.from(descriptor),
                    isMatch: true,
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                console.error("Error saving true positive feedback", error);
            }
        }
    },

    addFalsePositive: async (descriptor) => {
        set((state) => ({ falsePositives: [...state.falsePositives, descriptor] }));

        // Push to Firestore
        if (auth.currentUser) {
            try {
                await addDoc(collection(db, "face_feedback"), {
                    userId: auth.currentUser.uid,
                    descriptor: Array.from(descriptor),
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
