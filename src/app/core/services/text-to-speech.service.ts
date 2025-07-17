import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, retry, takeUntil, timeout } from 'rxjs/operators';
import { TTSProvider, TTSRequest, TTSConfig, TTSProviderType, TTSState } from '../api/interfaces/tts.interface';
import { TTSProviderFactory } from '../api/factories/tts-provider.factory';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService implements OnDestroy {
  private provider: TTSProvider;
  private config: TTSConfig;
  private currentAudio: HTMLAudioElement | null = null;
  private abortController: AbortController | null = null;
  private currentBlobUrl: string | null = null;
  private stateSubject = new BehaviorSubject<TTSState>(TTSState.Idle);
  public state$ = this.stateSubject.asObservable();
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();
  private readonly destroy$ = new Subject<void>();

  constructor(private providerFactory: TTSProviderFactory) {
    this.config = environment.tts;
    this.provider = this.providerFactory.createProvider(this.config.provider);
  }

  switchProvider = (providerType: TTSProviderType): void => {
    this.stop();
    this.config.provider = providerType;
    this.provider = this.providerFactory.createProvider(providerType);
  }

  speak = (text: string, voiceId?: string): void => {
    this.stop();

    if (!this.validateInput(text)) {
      return;
    }

    this.prepareForSpeech();

    const request = this.createSpeechRequest(text, voiceId);

    this.generateSpeech(request);
  }

  private validateInput = (text: string): boolean => {
    if (!text.trim()) {
      this.setState(TTSState.Error);
      this.errorSubject.next('Empty text provided');
      return false;
    }
    return true
  }

  private prepareForSpeech = (): void => {
    this.clearError();
    this.setState(TTSState.Loading);
    this.abortController = new AbortController();
  }

  private createSpeechRequest = (text: string, voiceId?: string): TTSRequest => {
    const request: TTSRequest = {
      text: text.trim(),
      voiceId: voiceId || this.config.defaultVoiceId,
      settings: this.config.defaultSettings
    };
    return request;
  }

  private generateSpeech = (request: TTSRequest): void => {
    this.provider.generateSpeech(request)
      .pipe(
        timeout(this.config.timeout),
        retry(this.config.retryAttempts),
        catchError(this.handleError),
        finalize(() => {
          if (this.stateSubject.value === TTSState.Loading) {
            this.setState(TTSState.Idle);
          }
        }),
        takeUntil(this.destroy$)
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

  private playAudio = (blob: Blob): void => {
    this.cleanupBlobUrl();
    this.currentBlobUrl = URL.createObjectURL(blob);
    this.currentAudio = new Audio(this.currentBlobUrl);
    this.currentAudio.addEventListener('ended', () => {
      this.setState(TTSState.Idle);
      this.cleanupBlobUrl();
    });

    this.currentAudio.addEventListener('error', () => {
      this.setState(TTSState.Error);
      this.errorSubject.next('Audio playback failed');
      this.cleanupBlobUrl();
    });

    this.currentAudio.play().then(() => {
      this.setState(TTSState.Playing);
    }).catch((error) => {
      this.errorSubject.next(`Audio playback failed: ${error.message}`);
      this.cleanupBlobUrl();
    });
  }

  stop = (): void => {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.cleanupBlobUrl();
    this.setState(TTSState.Idle);
  }

  private cleanupBlobUrl = (): void => {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  private handleError = (error: any): Observable<never> => {
    console.error('TTS Service Error:', error);
    return throwError(() => new Error(error.message || 'Unknown TTS error'));
  }

  private clearError = (): void => {
    this.errorSubject.next(null);
  }

  get isPlaying(): boolean {
    return this.currentAudio ? !this.currentAudio.paused : false;
  }

  private setState = (state: TTSState): void => {
    this.stateSubject.next(state);
  }

  get currentState(): TTSState {
    return this.stateSubject.value;
  }

  ngOnDestroy = (): void => {
    this.destroy$.next();
    this.destroy$.complete();
    this.stop();
  }
}
