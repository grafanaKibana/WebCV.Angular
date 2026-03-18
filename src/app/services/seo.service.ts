
import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const BASE_URL = 'https://reshetnik.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/assets/images/my-portrait.png`;
const DEFAULT_DESCRIPTION =
  'Nikita Reshetnik | Senior AI Engineer at DraftKings. 5+ years building .NET microservices and LLM-powered services. Kyiv, Ukraine.';

export interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly doc = inject(DOCUMENT);

  updatePageMeta(config: PageMeta): void {
    const description = config.description ?? DEFAULT_DESCRIPTION;
    const url = `${BASE_URL}${config.path ?? '/'}`;
    const image = config.image ?? DEFAULT_IMAGE;
    const ogType = config.type ?? 'website';

    this.titleService.setTitle(config.title);

    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: ogType });
    this.meta.updateTag({ property: 'og:image', content: image });

    this.meta.updateTag({ name: 'twitter:title', content: config.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    this.updateCanonical(url);
  }

  private updateCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }
}
