export interface PanelData {
  id: number;
  prompt: string;
  imageData: string | null; // Base64 string
  isLoading: boolean;
  error: string | null;
}

export interface WebtoonConfig {
  referenceImages: string[]; // Changed to array for multiple images
  styleDescription: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}