import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ElevenLabsRequest } from '../api/tts-ai-config';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  private readonly apiKey = environment.elevenLabs.apiKey;
  private readonly voiceId = environment.elevenLabs.voiceId;
  private readonly baseUrl = environment.elevenLabs.baseUrl;
  private readonly apiUrl = `${this.baseUrl}/text-to-speech/${this.voiceId}`;

  private audio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private currentBlobUrl: string | null = null;

  // Loading and error states
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private http: HttpClient) { }

  speak(text: string): void {
    this.stop();

    if (!text.trim()) {
      this.errorSubject.next('Text cannot be empty');
      return;
    }

    this.clearError();
    this.loadingSubject.next(true);
    this.abortController = new AbortController();

    const payload: ElevenLabsRequest = {
      text: text.trim(),
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.3,
        similarity_boost: 0.75,
      },
    };

    const headers = new HttpHeaders({
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    });

    this.http
      .post(this.apiUrl, payload, {
        headers,
        responseType: 'blob',
      })
      .pipe(
        timeout(30000),
        retry(2),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (blob: Blob) => {
          if (this.abortController?.signal.aborted) return;
          this.playAudio(blob);
        },
        error: (err) => {
          this.errorSubject.next(err.message || 'Failed to generate speech');
        },
      });
  }

  private playAudio(blob: Blob): void {
    this.cleanupBlobUrl();

    this.currentBlobUrl = URL.createObjectURL(blob);
    this.audio = new Audio(this.currentBlobUrl);

    this.audio.addEventListener('ended', () => this.cleanupBlobUrl());
    this.audio.addEventListener('error', () => {
      this.errorSubject.next('Audio playback failed');
      this.cleanupBlobUrl();
    });

    this.audio.play().catch((error) => {
      this.errorSubject.next('Audio playback failed: ' + error.message);
      this.cleanupBlobUrl();
    });
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }

    this.cleanupBlobUrl();
    this.loadingSubject.next(false);
  }

  private cleanupBlobUrl(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid API key';
          break;
        case 422:
          errorMessage = 'Invalid request parameters';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = `Server error (${error.status})`;
      }
    }

    console.error('TTS Service Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  get isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }

  ngOnDestroy(): void {
    this.stop();
  }
}
