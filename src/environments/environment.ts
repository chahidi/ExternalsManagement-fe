import { TTSProviderType } from '../app/core/api/interfaces/tts.interface';


export const environment = {
  apiUrl: "http://localhost:8080/api",
    apiInterviews: "http://localhost:3001",

production: false,
  tts: {
    provider: TTSProviderType.ELEVEN_LABS,
    apiKey: 'sk_ce780e1bae04d6204156b615046c2c30d05cd337015e07bf',
    baseUrl: 'https://api.elevenlabs.io/v1',
    defaultVoiceId: '21m00Tcm4TlvDq8ikWAM',
    defaultSettings: {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    },
    timeout: 30000,
    retryAttempts: 2
  }

};
