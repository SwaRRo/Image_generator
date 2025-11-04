export type GenerationType = 'image' | 'video';

// Fix: Replaced anonymous type with a named interface `AIStudio` to resolve a conflict
// with an existing global declaration for `window.aistudio`.
interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

declare global {
    interface Window {
        aistudio?: AIStudio;
    }
}
