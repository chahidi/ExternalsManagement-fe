// src/app/core/api/interfaces/tts.interface.ts
import { Observable } from "rxjs";

export interface TTSRequest {
  text: string;
  voiceId?: string;
  settings?: TTSVoiceSettings;
}

export interface TTSResponse {
  audio: Blob;
  contentType: string;
  size: number;
}

export interface TTSVoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  speed?: number;
  pitch?: number;
  volume?: number;
}

export interface TTSProvider {
  generateSpeech(request: TTSRequest): Observable<TTSResponse>;
  getSupportedVoices(): Observable<TTSVoice[]>;
  validateSettings(settings: TTSVoiceSettings): boolean;
}

export interface TTSVoice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  provider: string;
}

export interface TTSConfig {
  provider: TTSProviderType;
  apiKey: string;
  baseUrl: string;
  defaultVoiceId: string;
  defaultSettings: TTSVoiceSettings;
  timeout: number;
  retryAttempts: number;
}

export enum TTSProviderType {
  ELEVEN_LABS = 'eleven_labs',
  AZURE = 'azure',
  GOOGLE = 'google',
  AWS_POLLY = 'aws_polly'
}

export enum TTSState {
  Idle = 'IDLE',
  Loading = 'LOADING',
  Playing = 'PLAYING',
  Error = 'ERROR'
}
