import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TTSProvider, TTSRequest, TTSResponse, TTSVoice, TTSVoiceSettings } from '../interfaces/tts.interface';

@Injectable({
    providedIn: 'root'
})
export class ElevenLabsProvider implements TTSProvider {
    private readonly headers: HttpHeaders;

    constructor(
        private http: HttpClient,
        @Inject('ELEVEN_LABS_CONFIG') private config: any
    ) {
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
            'xi-api-key': this.config.apiKey
        });
    }

    generateSpeech(request: TTSRequest): Observable<TTSResponse> {
        const payload = this.transformRequest(request);
        const url = `${this.config.baseUrl}/text-to-speech/${request.voiceId || this.config.defaultVoiceId}`;

        return this.http
            .post(url, payload, {
                headers: this.headers,
                responseType: 'blob'
            })
            .pipe(
                map((blob: Blob) => ({
                    audio: blob,
                    contentType: 'audio/mpeg',
                    size: blob.size
                })),
                catchError(this.handleError.bind(this))
            );
    }

    getSupportedVoices(): Observable<TTSVoice[]> {
        return this.http
            .get<any[]>(`${this.config.baseUrl}/voices`, {
                headers: this.headers
            })
            .pipe(
                map((voices) =>
                    voices.map((voice) => ({
                        id: voice.voice_id,
                        name: voice.name,
                        language: voice.language || 'en-US',
                        gender: voice.gender || 'neutral',
                        provider: 'eleven_labs'
                    }))
                )
            );
    }

    validateSettings(settings: TTSVoiceSettings): boolean {
        if (settings.stability && (settings.stability < 0 || settings.stability > 1)) {
            return false;
        }
        if (settings.similarity_boost && (settings.similarity_boost < 0 || settings.similarity_boost > 1)) {
            return false;
        }
        return true;
    }

    private transformRequest(request: TTSRequest): any {
        return {
            text: request.text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: request.settings?.stability || 0.5,
                similarity_boost: request.settings?.similarity_boost || 0.5,
                style: request.settings?.style || 0.0,
                use_speaker_boost: request.settings?.use_speaker_boost || true
            }
        };
    }

    private handleError(error: any): Observable<never> {
        throw error;
    }
}
