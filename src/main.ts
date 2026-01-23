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

setViewportVars();
window.addEventListener('resize', setViewportVars);
window.addEventListener('orientationchange', setViewportVars);
window.visualViewport?.addEventListener('resize', setViewportVars);
window.visualViewport?.addEventListener('scroll', setViewportVars);


if (environment.production) {
  enableProdMode();
  inject();
}
injectSpeedInsights();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
