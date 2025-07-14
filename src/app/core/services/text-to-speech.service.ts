import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, retry, timeout } from 'rxjs/operators';
import { TTSProvider, TTSRequest, TTSConfig, TTSProviderType } from '../api/interfaces/tts.interface';
import { TTSProviderFactory } from '../api/factories/tts-provider.factory';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService implements OnDestroy {
  private provider: TTSProvider;
  private config: TTSConfig;

  private audio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private currentBlobUrl: string | null = null;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  constructor(private providerFactory: TTSProviderFactory) {
    this.config = environment.tts;
    this.provider = this.providerFactory.createProvider(this.config.provider);
  }

  switchProvider(providerType: TTSProviderType): void {
    this.stop();
    this.config.provider = providerType;
    this.provider = this.providerFactory.createProvider(providerType);
  }

  speak(text: string, voiceId?: string): void {
    this.stop();

    if (!text.trim()) {
      this.errorSubject.next('Empty text provided');
      return;
    }

    this.clearError();
    this.loadingSubject.next(true);
    this.abortController = new AbortController();

    const request: TTSRequest = {
      text: text.trim(),
      voiceId: voiceId || this.config.defaultVoiceId,
      settings: this.config.defaultSettings
    };

    this.provider.generateSpeech(request)
      .pipe(
        timeout(this.config.timeout),
        retry(this.config.retryAttempts),
        catchError(this.handleError.bind(this)),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe({
        next: (response) => {
          if (this.abortController?.signal.aborted) return;
          this.playAudio(response.audio);
        },
        error: (err) => {
          this.errorSubject.next(err.message || 'Speech generation failed');
        }
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
      this.errorSubject.next(`Audio playback failed: ${error.message}`);
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

  private handleError(error: any): Observable<never> {
    console.error('TTS Service Error:', error);
    return throwError(() => new Error(error.message || 'Unknown TTS error'));
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
