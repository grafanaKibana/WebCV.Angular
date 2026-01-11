import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { inject } from "@vercel/analytics"
import { injectSpeedInsights } from '@vercel/speed-insights';


if (environment.production) {
  enableProdMode();
  inject();
}
injectSpeedInsights();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
