import { POPULAR_VOICE_IDS } from '../app/core/constants/tts-ai.const';


export const environment = {
  apiUrl: "http://localhost:8080/api",
    apiInterviews: "http://localhost:3001",
  elevenLabs: {
    apiKey: 'sk_356820c37bb02abccebcc08faa76cef7e30daf05ad6e0e0c',
    baseUrl: 'https://api.elevenlabs.io/v1',
     voiceId: POPULAR_VOICE_IDS.PAUL,

  }
};
