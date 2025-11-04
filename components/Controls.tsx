
import React from 'react';
import { GenerationType } from '../types';

interface ControlsProps {
  story: string;
  setStory: (story: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  isLoading: boolean;
  isApiKeyReady: boolean;
  onGenerate: () => void;
  onSelectApiKey: () => void;
}

const GenerationTypeButton: React.FC<{
  type: GenerationType;
  current: GenerationType;
  onClick: (type: GenerationType) => void;
  Icon: React.ElementType;
}> = ({ type, current, onClick, Icon }) => (
  <button
    onClick={() => onClick(type)}
    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
      current === type
        ? 'bg-indigo-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    <Icon className="w-5 h-5" />
    {type.charAt(0).toUpperCase() + type.slice(1)}
  </button>
);


const Controls: React.FC<ControlsProps> = ({
  story,
  setStory,
  prompt,
  setPrompt,
  generationType,
  setGenerationType,
  isLoading,
  isApiKeyReady,
  onGenerate,
  onSelectApiKey,
}) => {
    const IconImage = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
    );
    const IconVideo = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>
    );

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col gap-6">
      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-300 mb-2">
          Your Story
        </label>
        <textarea
          id="story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Paste your full story here..."
          className="w-full h-48 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Scenario to Visualize
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A neon hologram of a cat driving at top speed through a futuristic city."
          className="w-full h-24 p-3 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium text-gray-300">Generation Type</span>
        <div className="flex gap-2">
            <GenerationTypeButton type="image" current={generationType} onClick={(t) => setGenerationType(t)} Icon={IconImage} />
            <GenerationTypeButton type="video" current={generationType} onClick={(t) => setGenerationType(t)} Icon={IconVideo} />
        </div>
      </div>
      
      {!isApiKeyReady && generationType === 'video' && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg text-sm">
            <p className="font-bold mb-1">Action Required</p>
            <p className="mb-3">Video generation requires a Google AI Studio API key. Please select one to continue.</p>
            <p className="mb-3">For information about billing, see <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">Google's documentation</a>.</p>
            <button
                onClick={onSelectApiKey}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Select API Key
            </button>
        </div>
      )}
      
      <button
        onClick={onGenerate}
        disabled={isLoading || !isApiKeyReady || !prompt}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : 'Generate'}
      </button>
    </div>
  );
};

export default Controls;
