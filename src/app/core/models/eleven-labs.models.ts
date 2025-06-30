// eleven-labs.models.ts
export interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
}

export interface ElevenLabsError {
  detail?: {
    status: string;
    message: string;
  };
}
