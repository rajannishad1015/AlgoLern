import { create } from 'zustand';
import { AlgorithmStep } from '../types/algorithm';

interface VisualizerStore {
  // Playback
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;

  // Input
  inputData: any;
  algorithmId: string;

  // Actions
  setSteps: (steps: AlgorithmStep[]) => void;
  setCurrentStep: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSpeed: (speed: number) => void;
  setInputData: (data: any) => void;
  setAlgorithmId: (id: string) => void;
  resetVisualizer: () => void;
  stepForward: () => void;
  stepBackward: () => void;
}

export const useVisualizerStore = create<VisualizerStore>((set) => ({
  steps: [],
  currentStepIndex: 0,
  isPlaying: false,
  speed: 500, // Default 500ms per step
  inputData: null,
  algorithmId: '',

  setSteps: (steps) => set({ steps }),
  
  setCurrentStep: (index) => set((state) => ({ 
    currentStepIndex: Math.max(0, Math.min(index, state.steps.length - 1)) 
  })),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  setSpeed: (speed) => set({ speed }),
  
  setInputData: (inputData) => set({ inputData }),
  
  setAlgorithmId: (algorithmId) => set({ algorithmId }),
  
  resetVisualizer: () => set({ currentStepIndex: 0, isPlaying: false }),
  
  stepForward: () => set((state) => ({
    currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1)
  })),
  
  stepBackward: () => set((state) => ({
    currentStepIndex: Math.max(0, state.currentStepIndex - 1)
  })),
}));
