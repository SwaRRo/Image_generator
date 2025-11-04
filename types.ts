export type GenerationType = 'image' | 'video';

// Fix: Moved the AIStudio interface into `declare global` to resolve a conflict
// with an existing global declaration for `window.aistudio`.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }

    interface Window {
        aistudio?: AIStudio;
    }
}
