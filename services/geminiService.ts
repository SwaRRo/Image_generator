
import { GoogleGenAI } from "@google/genai";

const VIDEO_LOADING_MESSAGES = [
    "Warming up the virtual cameras...",
    "Rendering the first few frames...",
    "Consulting with the digital director...",
    "Adding special effects...",
    "Finalizing the color grade...",
    "Almost ready for the premiere...",
];

// Helper to wait for a specified time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }

    throw new Error("Image generation failed or returned no images.");
};

export const generateVideoFromPrompt = async (prompt: string, setLoadingMessage: (message: string) => void): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set for video generation.");
    }
    // Instantiate new client to ensure latest key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
        }
    });

    let messageIndex = 0;
    while (!operation.done) {
        setLoadingMessage(VIDEO_LOADING_MESSAGES[messageIndex % VIDEO_LOADING_MESSAGES.length]);
        messageIndex++;
        await sleep(10000); 
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    if (!downloadLink) {
        throw new Error("Video generation completed, but no download link was found.");
    }

    setLoadingMessage("Fetching your video...");

    // The API key must be appended to the download URL
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
