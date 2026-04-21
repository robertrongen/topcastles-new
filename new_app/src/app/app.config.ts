import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { CastleService } from './services/castle.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideAppInitializer(() => inject(CastleService).loadCastles()),
  ]
};
