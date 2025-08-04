import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { ELEVEN_LABS_CONFIG } from './app/core/api/interfaces/tts-ai-config';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    {
      provide: ELEVEN_LABS_CONFIG,
      useValue: environment.tts
    }
  ]
}).catch((err) => console.error(err));
