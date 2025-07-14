import { Injectable } from '@angular/core';
import { TTSProvider, TTSProviderType } from '../interfaces/tts.interface';
import { ElevenLabsProvider } from '../providers/eleven-labs.provider';

@Injectable({
  providedIn: 'root'
})
export class TTSProviderFactory {
  constructor(
    private elevenLabsProvider: ElevenLabsProvider,
  ) {}

  createProvider(providerType: TTSProviderType): TTSProvider {
    switch (providerType) {
      case TTSProviderType.ELEVEN_LABS:
        return this.elevenLabsProvider;
      default:
        throw new Error(`Unsupported TTS provider: ${providerType}`);
    }
  }
}
