
import React from 'react';
import { GenerationType } from '../types';

interface MediaOutputProps {
  outputUrl: string | null;
  generationType: GenerationType;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center gap-4">
        <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg font-semibold text-gray-300">{message}</p>
        {message.toLowerCase().includes('video') && <p className="text-sm text-gray-500">This can take a few minutes. Please wait.</p>}
    </div>
);

const Placeholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center gap-4 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-6-6v-1.5a6 6 0 0 0-6 6v1.5a6 6 0 0 0 6 6Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3v-1.5a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3Z" />
        </svg>
        <h3 className="text-xl font-bold">Your Visual Awaits</h3>
        <p>Your generated image or video will appear here.</p>
    </div>
);


const MediaOutput: React.FC<MediaOutputProps> = ({
  outputUrl,
  generationType,
  isLoading,
  loadingMessage,
  error,
}) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-2xl flex items-center justify-center min-h-[300px] lg:min-h-full aspect-video">
      <div className="w-full h-full flex items-center justify-center bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700">
        {isLoading && <LoadingIndicator message={loadingMessage} />}
        
        {!isLoading && error && (
            <div className="text-center text-red-400 p-4">
                <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
                <p className="text-sm">{error}</p>
            </div>
        )}

        {!isLoading && !error && outputUrl && (
          generationType === 'image' ? (
            <img src={outputUrl} alt="Generated visual" className="max-w-full max-h-full object-contain rounded-md" />
          ) : (
            <video src={outputUrl} controls className="max-w-full max-h-full rounded-md" />
          )
        )}

        {!isLoading && !error && !outputUrl && <Placeholder />}
      </div>
    </div>
  );
};

export default MediaOutput;
