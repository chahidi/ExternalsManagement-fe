// src/app/core/api/interfaces/speech-recognition.interface.ts
export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  timestamp?: number;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  finalTranscript: string;
  interimTranscript: string;
  combinedTranscript: string;
}

export interface SpeechRecognitionConfig {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  autoRestart?: boolean;
  restartDelay?: number;
}

export interface SpeechRecognitionEvent {
  type: 'start' | 'end' | 'result' | 'error' | 'speechstart' | 'speechend';
  data?: any;
  timestamp: number;
}

export interface SpeechRecognitionError {
  error: string;
  message: string;
  code?: string;
}

export interface ISpeechRecognitionService {
  // State management
  isSupported(): boolean;
  getCurrentState(): SpeechRecognitionState;

  // Control methods
  start(): void;
  stop(): void;
  reset(): void;

  // Transcript methods
  getFinalTranscript(): string;
  getInterimTranscript(): string;
  getCombinedTranscript(): string;

  // Configuration
  configure(config: SpeechRecognitionConfig): void;

  // Cleanup
  destroy(): void;
}
