import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import { ArticleModel } from '../interfaces/articleModel';
import { BlogDataService } from '../services/blog-data.service';

interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface ShareLink {
  label: string;
  url: string;
  iconClass: string;
}

@Component({
  selector: 'app-blog-detail-page',
  templateUrl: './blog-detail-page.component.html',
  styleUrls: ['./blog-detail-page.component.scss']
})
export class BlogDetailPageComponent implements OnInit, OnDestroy {
  article?: ArticleModel;
  contentHtml: SafeHtml | null = null;
  tocItems: TocItem[] = [];
  readingTimeMinutes = 0;
  shareLinks: ShareLink[] = [];
  copyLabel = 'Copy link';
  copySuccess = false;

  private readonly destroy$ = new Subject<void>();
  private currentUrl = '';

  constructor(
    private route: ActivatedRoute,
    private blogDataService: BlogDataService,
    private sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => this.blogDataService.getArticleBySlug(params.get('slug') ?? '')),
        takeUntil(this.destroy$)
      )
      .subscribe(article => {
        this.article = article;
        if (!article) {
          this.contentHtml = null;
          this.tocItems = [];
          this.shareLinks = [];
          return;
        }

        this.renderMarkdown(article.content);
        this.currentUrl = this.document.location.href;
        this.shareLinks = this.buildShareLinks(article, this.currentUrl);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  copyLink(): void {
    if (!this.currentUrl || !navigator?.clipboard) {
      this.copyLabel = 'Copy not supported';
      return;
    }

    navigator.clipboard.writeText(this.currentUrl)
      .then(() => {
        this.copyLabel = 'Copied';
        this.copySuccess = true;
        setTimeout(() => {
          this.copyLabel = 'Copy link';
          this.copySuccess = false;
        }, 3000);
      })
      .catch(() => {
        this.copyLabel = 'Copy failed';
        this.copySuccess = false;
      });
  }

  private renderMarkdown(markdown: string): void {
    const tocItems: TocItem[] = [];
    const slugCounts = new Map<string, number>();
    const renderer = new marked.Renderer();

    renderer.heading = (token) => {
      const normalizedLevel = this.normalizeHeadingLevel(token.depth);
      const base = this.slugify(token.text) || 'section';
      const count = (slugCounts.get(base) ?? 0) + 1;
      slugCounts.set(base, count);
      const anchor = count > 1 ? `${base}-${count}` : base;
      tocItems.push({
        id: anchor,
        text: token.text,
        level: normalizedLevel
      });
      const inner = marked.Parser.parseInline(token.tokens, { renderer });
      return `<h${normalizedLevel} id="${anchor}">${inner}</h${normalizedLevel}>`;
    };

    renderer.code = (token) => {
      const language = (token.lang ?? '').trim().split(/\s+/)[0].toLowerCase();
      const canHighlight = Boolean(language && hljs.getLanguage(language));
      const highlighted = canHighlight
        ? hljs.highlight(token.text, { language, ignoreIllegals: true }).value
        : hljs.highlightAuto(token.text).value;
      const className = canHighlight ? `language-${language}` : 'language-plaintext';
      return `<pre><code class="hljs ${className}">${highlighted}</code></pre>`;
    };

    const html = marked(markdown, {
      gfm: true,
      breaks: false,
      renderer
    }) as string;

    this.contentHtml = this.sanitizer.bypassSecurityTrustHtml(html);
    this.tocItems = tocItems;
    this.readingTimeMinutes = this.estimateReadingTimeFromText(this.stripHtml(html));
  }

  private estimateReadingTimeFromText(text: string): number {
    const words = text
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
  }

  private buildShareLinks(article: ArticleModel, url: string): ShareLink[] {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(article.headline);
    return [
      {
        label: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
        iconClass: 'fa-brands fa-twitter'
      },
      {
        label: 'LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        iconClass: 'fa-brands fa-linkedin-in'
      }
    ];
  }

  private normalizeHeadingLevel(level: number): 1 | 2 | 3 | 4 | 5 | 6 {
    if (level <= 1) {
      return 1;
    }
    if (level >= 6) {
      return 6;
    }
    return level as 2 | 3 | 4 | 5 | 6;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ');
  }
}
