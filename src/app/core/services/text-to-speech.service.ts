import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, finalize, retry, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ElevenLabsRequest } from '../api/tts-ai-config';
import { DEFAULT_VOICE_SETTINGS, MODEL_ID } from '../constants/tts-ai.const';
import { ERROR_MESSAGES } from '../constants/error-messages.const';
import { HTTP_STATUS_CODES, DEFAULT_HEADERS } from '../constants/http-const';

@Injectable({
    providedIn: 'root'
})
export class TextToSpeechService implements OnDestroy {
    private readonly apiKey = environment.elevenLabs.apiKey;
    private readonly voiceId = environment.elevenLabs.voiceId;
    private readonly baseUrl = environment.elevenLabs.baseUrl;
    private readonly apiUrl = `${this.baseUrl}/text-to-speech/${this.voiceId}`;

    private readonly headers = new HttpHeaders({
        ...DEFAULT_HEADERS,
        'xi-api-key': this.apiKey
    });

    private audio: HTMLAudioElement | null = null;
    private abortController: AbortController | null = null;
    private currentBlobUrl: string | null = null;

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private errorSubject = new BehaviorSubject<string | null>(null);
    public error$ = this.errorSubject.asObservable();

    constructor(private http: HttpClient) { }

    speak(text: string): void {
        this.stop();

        if (!text.trim()) {
            this.errorSubject.next(ERROR_MESSAGES.EMPTY_TEXT);
            return;
        }

        this.clearError();
        this.loadingSubject.next(true);
        this.abortController = new AbortController();

        const payload: ElevenLabsRequest = {
            text: text.trim(),
            model_id: MODEL_ID,
            voice_settings: DEFAULT_VOICE_SETTINGS
        };

        this.http
            .post(this.apiUrl, payload, {
                headers: this.headers,
                responseType: 'blob'
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
                    this.errorSubject.next(err.message || ERROR_MESSAGES.GENERATE_FAIL);
                }
            });
    }

    private playAudio(blob: Blob): void {
        this.cleanupBlobUrl();
        this.currentBlobUrl = URL.createObjectURL(blob);
        this.audio = new Audio(this.currentBlobUrl);

        this.audio.addEventListener('ended', () => this.cleanupBlobUrl());

        this.audio.addEventListener('error', () => {
            this.errorSubject.next(ERROR_MESSAGES.AUDIO_FAILED);
            this.cleanupBlobUrl();
        });

        this.audio.play().catch((error) => {
            this.errorSubject.next(ERROR_MESSAGES.AUDIO_FAILED_WITH_REASON + error.message);
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
        let errorMessage = ERROR_MESSAGES.UNKNOWN;

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client-side error: ${error.error.message}`;
        } else {
            switch (error.status) {
                case HTTP_STATUS_CODES.UNAUTHORIZED:
                    errorMessage = ERROR_MESSAGES.API.INVALID_KEY;
                    break;
                case HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY:
                    errorMessage = ERROR_MESSAGES.API.INVALID_PARAMETERS;
                    break;
                case HTTP_STATUS_CODES.TOO_MANY_REQUESTS:
                    errorMessage = ERROR_MESSAGES.API.RATE_LIMIT;
                    break;
                case HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR:
                    errorMessage = ERROR_MESSAGES.API.SERVER_ERROR;
                    break;
                default:
                    errorMessage = ERROR_MESSAGES.API.GENERIC(error.status);
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
