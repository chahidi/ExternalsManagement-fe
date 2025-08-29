import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private apiUrl = `${environment.apiUrl}/api/v1/questions`;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor(private http: HttpClient) {}


  async speak(text: string): Promise<void> {
    try {
      this.stop();

      const audioBlob = await firstValueFrom(this.generateAudio(text));

      if (!audioBlob) {
        throw new Error('Failed to generate audio');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      this.isPlaying = true;

      return new Promise((resolve, reject) => {
        if (!this.currentAudio) {
          reject(new Error('Audio not initialized'));
          return;
        }

        this.currentAudio.onended = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(new Error('Audio playback failed'));
        };

        this.currentAudio.onabort = () => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        this.currentAudio.play().catch((error) => {
          this.isPlaying = false;
          URL.revokeObjectURL(audioUrl);
          reject(error);
        });
      });
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }


  stop(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }


  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }


  private generateAudio(text: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const requestBody = { text };

    return this.http.post(`${this.apiUrl}/generateAudio`, requestBody, {
      headers,
      responseType: 'blob'
    });
  }
}
