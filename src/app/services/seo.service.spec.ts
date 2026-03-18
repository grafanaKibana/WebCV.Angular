import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let meta: Meta;
  let titleService: Title;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    titleService = TestBed.inject(Title);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    const canonical = doc.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.remove();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set page title', () => {
    service.updatePageMeta({ title: 'Test Title' });
    expect(titleService.getTitle()).toBe('Test Title');
  });

  it('should set all meta tags with full config', () => {
    service.updatePageMeta({
      title: 'My Page',
      description: 'Custom description',
      path: '/blog',
      image: 'https://example.com/image.png',
      type: 'article'
    });

    expect(meta.getTag('name="description"')?.content).toBe('Custom description');
    expect(meta.getTag('property="og:title"')?.content).toBe('My Page');
    expect(meta.getTag('property="og:description"')?.content).toBe('Custom description');
    expect(meta.getTag('property="og:url"')?.content).toBe('https://reshetnik.vercel.app/blog');
    expect(meta.getTag('property="og:type"')?.content).toBe('article');
    expect(meta.getTag('property="og:image"')?.content).toBe('https://example.com/image.png');
    expect(meta.getTag('name="twitter:title"')?.content).toBe('My Page');
    expect(meta.getTag('name="twitter:description"')?.content).toBe('Custom description');
    expect(meta.getTag('name="twitter:image"')?.content).toBe('https://example.com/image.png');
  });

  it('should use default values when optional config is omitted', () => {
    service.updatePageMeta({ title: 'Minimal' });

    expect(meta.getTag('property="og:url"')?.content).toBe('https://reshetnik.vercel.app/');
    expect(meta.getTag('property="og:type"')?.content).toBe('website');
    expect(meta.getTag('name="description"')?.content).toContain('Nikita Reshetnik');
    expect(meta.getTag('property="og:image"')?.content).toContain('my-portrait.png');
  });

  it('should create canonical link if none exists', () => {
    service.updatePageMeta({ title: 'Test', path: '/blog' });

    const canonical = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical?.href).toContain('https://reshetnik.vercel.app/blog');
  });

  it('should update existing canonical link', () => {
    service.updatePageMeta({ title: 'Test', path: '/blog' });
    service.updatePageMeta({ title: 'Test 2', path: '/about' });

    const canonicals = doc.querySelectorAll('link[rel="canonical"]');
    expect(canonicals.length).toBe(1);
    expect((canonicals[0] as HTMLLinkElement).href).toContain('https://reshetnik.vercel.app/about');
  });
});
