import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  let lastAppHeightPx: number | null = null;
  let rafPending = false;

  function scheduleViewportVarsUpdate(): void {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const height = window.visualViewport?.height ?? window.innerHeight;
      const floored = Math.floor(height);
      if (lastAppHeightPx !== null && Math.abs(lastAppHeightPx - floored) < 2) {
        return;
      }
      lastAppHeightPx = floored;
      document.documentElement.style.setProperty('--app-height', `${floored}px`);
    });
  }

  scheduleViewportVarsUpdate();
  window.addEventListener('resize', scheduleViewportVarsUpdate);
  window.addEventListener('orientationchange', scheduleViewportVarsUpdate);
  window.visualViewport?.addEventListener('resize', scheduleViewportVarsUpdate);

  import('@vercel/analytics').then(m => {
    if (environment.production) m.inject();
  });
  import('@vercel/speed-insights').then(m => m.injectSpeedInsights());
}

bootstrapApplication(AppComponent, {...appConfig, providers: [provideZoneChangeDetection(), ...appConfig.providers]})
  .catch(err => console.error(err));
