
import React, { useState, useCallback, useEffect } from 'react';
import { GenerationType } from './types';
import { generateImageFromPrompt, generateVideoFromPrompt } from './services/geminiService';
import Controls from './components/Controls';
import MediaOutput from './components/MediaOutput';

const Header: React.FC = () => (
  <header className="text-center p-6 border-b border-gray-700">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
      Story Visualizer
    </h1>
    <p className="mt-2 text-lg text-gray-400">Bring your stories to life with AI-generated visuals.</p>
  </header>
);

const App: React.FC = () => {
  const [story, setStory] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [generationType, setGenerationType] = useState<GenerationType>('image');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(true);

  useEffect(() => {
    if (generationType === 'video') {
      const checkKey = async () => {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            // If the aistudio object is not available, assume we can proceed for local dev.
            setApiKeySelected(true); 
        }
      };
      checkKey();
    } else {
      setApiKeySelected(true);
    }
  }, [generationType]);

  const handleSelectApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        try {
            await window.aistudio.openSelectKey();
            // Assume success after dialog is closed to avoid race condition
            setApiKeySelected(true);
            setError(null);
        } catch (e) {
            console.error("Error opening API key selection:", e);
            setError("Could not select API key. Please try again.");
        }
      }
  };


  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please provide a scenario or prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutputUrl(null);

    try {
      if (generationType === 'image') {
        setLoadingMessage('Crafting your image...');
        const imageUrl = await generateImageFromPrompt(prompt);
        setOutputUrl(imageUrl);
      } else if (generationType === 'video') {
        setLoadingMessage('Initializing video generation...');
        const videoUrl = await generateVideoFromPrompt(prompt, setLoadingMessage);
        setOutputUrl(videoUrl);
      }
    } catch (e: any) {
      console.error(e);
      let errorMessage = e.message || 'An unknown error occurred.';
      if (errorMessage.includes("Requested entity was not found")) {
        errorMessage = "API Key not found or invalid. Please select a valid API key for video generation.";
        setApiKeySelected(false);
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [prompt, generationType]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Controls
            story={story}
            setStory={setStory}
            prompt={prompt}
            setPrompt={setPrompt}
            generationType={generationType}
            setGenerationType={setGenerationType}
            isLoading={isLoading}
            isApiKeyReady={apiKeySelected}
            onGenerate={handleGenerate}
            onSelectApiKey={handleSelectApiKey}
          />
          <MediaOutput
            outputUrl={outputUrl}
            generationType={generationType}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            error={error}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
