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

const extractContextFromStory = (fullStory: string, keySentence: string): string => {
  if (!fullStory.trim()) {
      throw new Error("The story is empty. Please provide a story.");
  }
  if (!keySentence.trim()) {
      throw new Error("Please provide a key sentence from the story.");
  }

  const trimmedKeySentence = keySentence.trim();
  // Use a case-insensitive check for better UX
  if (fullStory.toLowerCase().indexOf(trimmedKeySentence.toLowerCase()) === -1) {
      throw new Error("The key sentence was not found in the story. Please make sure it's an exact copy from the text above.");
  }

  // Split story into paragraphs. A paragraph is separated by one or more newlines.
  const paragraphs = fullStory.split(/\n+/).filter(p => p.trim() !== '');

  const containingParagraphIndex = paragraphs.findIndex(p => p.toLowerCase().includes(trimmedKeySentence.toLowerCase()));

  if (containingParagraphIndex !== -1) {
      const contextParagraphs = [];

      // Add the paragraph before, if it exists
      if (containingParagraphIndex > 0) {
          contextParagraphs.push(paragraphs[containingParagraphIndex - 1].trim());
      }

      // Add the main paragraph
      contextParagraphs.push(paragraphs[containingParagraphIndex].trim());

      // Add the paragraph after, if it exists
      if (containingParagraphIndex < paragraphs.length - 1) {
          contextParagraphs.push(paragraphs[containingParagraphIndex + 1].trim());
      }
      
      return contextParagraphs.join('\n\n');
  }

  // This case should ideally not be hit because of the `includes` check above,
  // but it's a safe fallback.
  throw new Error("Could not isolate the paragraph containing the key sentence.");
};


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
    setError(null);

    if (generationType === 'image') {
      if (!story) {
        setError('Please provide a story to visualize.');
        return;
      }
      if (!prompt) {
        setError('Please provide a key sentence from the story.');
        return;
      }
    } else { // video
      if (!prompt) {
        setError('Please provide a scenario to visualize for the video.');
        return;
      }
    }


    setIsLoading(true);
    setOutputUrl(null);

    try {
      if (generationType === 'image') {
        setLoadingMessage('Finding scene in story...');
        const imagePrompt = extractContextFromStory(story, prompt);
        setLoadingMessage('Crafting your image...');
        const imageUrl = await generateImageFromPrompt(imagePrompt);
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
  }, [prompt, story, generationType]);

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