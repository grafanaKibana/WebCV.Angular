import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';


function setViewportVars() {
  const height = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}

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


if (environment.production) {
  inject();
}
injectSpeedInsights();

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
