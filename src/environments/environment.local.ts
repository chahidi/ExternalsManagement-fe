import { POPULAR_VOICE_IDS } from '../app/core/constants/tts-ai.const';


export const environment = {
  apiUrl: "http://localhost:8080/api",
    apiInterviews: "http://localhost:3001",
  elevenLabs: {
    apiKey: 'sk_99720684143252b212e8bbc44e03c2f980bb00bf54b31295',
    baseUrl: 'https://api.elevenlabs.io/v1',
     voiceId: POPULAR_VOICE_IDS.PAUL,

  }
};
