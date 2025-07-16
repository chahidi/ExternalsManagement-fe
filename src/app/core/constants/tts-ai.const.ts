// stability,  similarity_boost,style have values from 0.0 to 1.0
export interface VoiceSettings {
    stability: number;        
    similarity_boost: number; 
    style?: number;          
    use_speaker_boost?: boolean;
}

// Common voice IDs (you can get these from ElevenLabs)
export const POPULAR_VOICE_IDS = {
    RACHEL: '21m00Tcm4TlvDq8ikWAM',
    DREW: '29vD33N1CtxCmqQRPOHJ',
    CLYDE: '2EiwWnXFnvU5JabPnv8n',
    PAUL: '5Q0t7uMcjvnagumLfvZi',
    DOMI: 'AZnzlk1XvdvUeBnXmlld',
    DAVE: 'CYw3kZ02Hs0563khs1Fj',
    FINN: 'D38z5RcWu1voky8WS1ja',
    FREYA: 'jsCqWAovK2LkecY7zXl4',
    GRACE: 'oWAxZDx7w5VEj9dCyTzz',
    DANIEL: 'onwK4e9ZLuTAKqWW03F9'
} as const;

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.0,
    use_speaker_boost: true
};

export const MODEL_ID = 'eleven_monolingual_v1';
