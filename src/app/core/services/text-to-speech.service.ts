import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private apiKey = 'sk_356820c37bb02abccebcc08faa76cef7e30daf05ad6e0e0c';
  private voiceId = 'EXAVITQu4vr4xnSDxMaL';
  private audio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;

  constructor() {}

  speak(text: string): void {
    this.stop(); // Stop any in-progress request and audio

    this.abortController = new AbortController();

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
    const headers = {
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };

    const body = {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.3,
        similarity_boost: 0.75,
      },
    };

    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: this.abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to get audio');

        // If stop() was called before response finished
        if (this.abortController?.signal.aborted) return;

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        // Double-check: did stop() happen while waiting for blob?
        if (this.abortController?.signal.aborted) return;

        this.audio = new Audio(blobUrl);
        this.audio.play();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('TTS error:', error);
        }
      });
  }

  stop(): void {
    // stop audio if playing
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }

    // abort request
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}




// sk_356820c37bb02abccebcc08faa76cef7e30daf05ad6e0e0c
