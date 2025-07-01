export interface ElevenLabsRequest {
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface ElevenLabsResponse {
  audio: Blob;
  contentType: string;
  size: number;
}

export interface VoiceSettings {
  stability: number;        // 0.0 to 1.0
  similarity_boost: number; // 0.0 to 1.0
  style?: number;          // 0.0 to 1.0
  use_speaker_boost?: boolean;
}

export interface GenerateSpeechPayload {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}



