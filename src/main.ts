import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { inject } from "@vercel/analytics"
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
  enableProdMode();
  inject();
}
injectSpeedInsights();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
