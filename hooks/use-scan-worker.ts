import { useEffect, useRef, useState, useCallback } from 'react';
import { useScanStore } from '@/store/scan-store';
import { useFaceStore } from '@/store/face-store';
import { euclideanDistance } from "@/lib/face-api";

export function useScanWorker() {
    const workerRef = useRef<Worker | null>(null);
    const [workerReady, setWorkerReady] = useState(false);
    const { addResult, updateProgress } = useScanStore();
    const referenceDescriptor = useFaceStore(state => state.referenceDescriptor);

    useEffect(() => {
        // Initialize worker
        // Note: Next.js handling of workers:
        // We might need to use `new Worker(new URL('@/worker/face.worker.ts', import.meta.url))` 
        // but with TypeScript and Next.js, a simple import might be tricky without specific config.
        // A common pattern is putting the worker in `public` or using a specific loader.
        // For now, let's try the standard Webpack 5 pattern if Next.js supports it out of the box (it usually does).

        try {
            // Worker file lives at `/worker/face.worker.ts` relative to the project root.
            // From `hooks/use-scan-worker.ts` the correct relative path is `../worker/face.worker.ts`.
            workerRef.current = new Worker(new URL('../worker/face.worker.ts', import.meta.url));

            workerRef.current.onmessage = (e) => {
                const { type, payload } = e.data;
                if (type === 'MODELS_LOADED') {
                    setWorkerReady(true);
                    console.log('Worker models loaded');
                } else if (type === 'RESULT') {
                    handleResult(payload);
                } else if (type === 'ERROR') {
                    console.error('Worker Error:', payload);
                }
            };

            // Load models in worker
            workerRef.current.postMessage({
                type: 'LOAD_MODELS',
                payload: { modelUrl: '/models' }
            });

        } catch (error) {
            console.error("Failed to initialize worker", error);
        }

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    const handleResult = useCallback((payload: { id: string, descriptor: number[] | null }) => {
        // Compare with reference
        if (!referenceDescriptor || !payload.descriptor) {
            updateProgress(1); // Processed but no match
            return;
        }

        const desc = new Float32Array(payload.descriptor);
        const distance = euclideanDistance(referenceDescriptor, desc);
        const threshold = 0.6; // Configurable?

        if (distance < threshold) {
            // Match!
            // We need to fetch file details or pass them through result?
            // For now, let's assume we have them in the store or can reconstruct.
            // Ideally the worker payload should mirror the input id so we know which file.

            // We need to look up the file metadata.
            // But here we only have ID.
            // We can pass metadata to worker and get it back, OR look it up.
            // For simplicity, let's assume we handle the "Success" by just adding the ID and let the UI fetch/display.
            // Actually, `ScanStore` `addResult` expects `ScanResult`. 
            // We can't construct `ScanResult` here fully without metadata.

            // To fix this, let's update `handleResult` to just signal match, 
            // and the caller (who starts the scan) handles the metadata.
            // OR simpler: The worker returns the ID, and we look up the file in `files` list if available.
        }

        // This logic is getting split. 
        // Better: The caller (Dashboard) manages the queue and the worker just processes.
        // When worker returns, we need a way to resolve the specific task.
        // We can use a Promise-based approach for the worker wrapper.
    }, [referenceDescriptor, updateProgress]);

    const scanImage = useCallback((imageUrl: string, id: string) => {
        if (!workerRef.current || !workerReady) return;
        workerRef.current.postMessage({ type: 'DETECT', payload: { imageUrl, id } });
    }, [workerReady]);

    // Promise based scan
    const scanImageAsync = useCallback((imageUrl: string, id: string): Promise<Float32Array | null> => {
        return new Promise((resolve, reject) => {
            if (!workerRef.current || !workerReady) {
                reject(new Error('Worker not ready'));
                return;
            }

            const handler = (e: MessageEvent) => {
                const { type, payload } = e.data;
                if (type === 'RESULT' && payload.id === id) {
                    workerRef.current?.removeEventListener('message', handler);
                    resolve(payload.descriptor ? new Float32Array(payload.descriptor) : null);
                } else if (type === 'ERROR' && payload.id === id) {
                    workerRef.current?.removeEventListener('message', handler);
                    resolve(null); // Fail gracefully for now
                }
            };

            workerRef.current.addEventListener('message', handler);
            workerRef.current.postMessage({ type: 'DETECT', payload: { imageUrl, id } });
        });
    }, [workerReady]);

    return { scanImageAsync, workerReady };
}
