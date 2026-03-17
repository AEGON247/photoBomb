



const MODEL_URL = '/models';

class FaceApiService {
    private modelsLoaded = false;
    private faceapi: any = null;

    async getFaceApi() {
        if (this.faceapi) return this.faceapi;
        this.faceapi = await import('@vladmandic/face-api');
        return this.faceapi;
    }

    async loadModels() {
        if (this.modelsLoaded) return;
        const faceapi = await this.getFaceApi();

        try {
            
            await faceapi.tf.setBackend('webgl');
            await faceapi.tf.ready();

            
            await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
            await faceapi.loadFaceLandmarkModel(MODEL_URL);
            await faceapi.loadFaceRecognitionModel(MODEL_URL);
            this.modelsLoaded = true;
            console.log("Face API models loaded");
        } catch (error) {
            console.error("Failed to load Face API models", error);
            throw error;
        }
    }

    async detectFace(image: HTMLImageElement | HTMLVideoElement) {
        if (!this.modelsLoaded) await this.loadModels();
        const faceapi = await this.getFaceApi();

        
        const detection = await faceapi.detectSingleFace(image, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

        return detection;
    }

    async detectAllFaces(image: HTMLImageElement | HTMLVideoElement) {
        if (!this.modelsLoaded) await this.loadModels();
        const faceapi = await this.getFaceApi();

        return await faceapi.detectAllFaces(image, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
            .withFaceLandmarks()
            .withFaceDescriptors();
    }

    
    async createImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    }
}

export const faceApiService = new FaceApiService();

export function euclideanDistance(desc1: Float32Array | number[], desc2: Float32Array | number[]): number {
    if (desc1.length !== desc2.length) return 1.0;
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        const diff = desc1[i] - desc2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}
