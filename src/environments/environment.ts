import { POPULAR_VOICE_IDS } from '../app/core/constants/tts-ai.const';

export const environment = {
  production: false,
    apiUrl: "http://localhost:8080/api",
  apiInterviews: "http://localhost:3001",
elevenLabs: {
    apiKey: '', 
    baseUrl: 'https://api.elevenlabs.io/v1',
     voiceId: POPULAR_VOICE_IDS.PAUL,
  }

};
