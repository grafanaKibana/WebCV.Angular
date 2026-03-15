import { DatePipe, DOCUMENT } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';
import { ArticleModel } from '../interfaces/articleModel';
import { BlogDataService } from '../services/blog-data.service';
import { HomeDataService, SidebarInfo } from '../../../services/home-data.service';
import { CopyButtonComponent } from '../../../shared/components/copy-button/copy-button.component';

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
  standalone: true,
  imports: [RouterLink, CopyButtonComponent, DatePipe],
  templateUrl: './blog-detail-page.component.html',
  styleUrls: ['./blog-detail-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('sectionAnimation', [
      transition('* => *', [
        query('.blog-hero, .blog-content', [
          style({ transform: 'translateY(16px)' }),
          stagger(80, [
            animate('420ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class BlogDetailPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('contentBody') contentBodyRef?: ElementRef<HTMLElement>;
  article?: ArticleModel;
  articleLoaded = false;
  sectionAnimationTick = 0;
  contentHtml: SafeHtml | null = null;
  tocItems: TocItem[] = [];
  readingTimeMinutes = 0;
  shareLinks: ShareLink[] = [];
  currentUrl = '';
  authorName = '';
  authorTitle = '';
  authorAvatarUrl = 'assets/images/my-portrait.png';

  private readonly destroy$ = new Subject<void>();
  private copyButtonsInitialized = false;
  private readonly route = inject(ActivatedRoute);
  private readonly blogDataService = inject(BlogDataService);
  private readonly homeDataService = inject(HomeDataService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getSidebarInfo()
      .pipe(takeUntil(this.destroy$))
      .subscribe(info => {
        this.authorName = `${info.firstName} ${info.lastName}`;
        this.authorTitle = info.positionTitle;
        this.cdr.markForCheck();
      });

    this.route.paramMap
      .pipe(
        switchMap(params => this.blogDataService.getArticleBySlug(params.get('slug') ?? '')),
        takeUntil(this.destroy$)
      )
      .subscribe(article => {
        this.articleLoaded = true;
        this.article = article;
        if (!article) {
          this.contentHtml = null;
          this.tocItems = [];
          this.shareLinks = [];
          this.cdr.markForCheck();
          return;
        }

        this.copyButtonsInitialized = false;
        this.renderMarkdown(article.content);
        this.currentUrl = this.document.location.href;
        this.shareLinks = this.buildShareLinks(article, this.currentUrl);
        this.cdr.markForCheck();
        requestAnimationFrame(() => {
          this.sectionAnimationTick += 1;
          this.cdr.markForCheck();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewChecked(): void {
    if (this.contentBodyRef && this.contentHtml && !this.copyButtonsInitialized) {
      this.initCopyButtons();
      this.copyButtonsInitialized = true;
    }
  }

  private initCopyButtons(): void {
    const container = this.contentBodyRef?.nativeElement;
    if (!container) return;

    const copyButtons = container.querySelectorAll<HTMLButtonElement>('.code-block__copy');
    copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const code = btn.getAttribute('data-code') ?? '';
        const decodedCode = this.unescapeHtml(code);
        this.copyCodeToClipboard(decodedCode, btn);
      });
    });
  }

  private copyCodeToClipboard(code: string, button: HTMLButtonElement): void {
    if (!navigator?.clipboard) return;

    // Prevent rapid re-clicks during animation
    if (button.classList.contains('copy-button--success')) return;

    navigator.clipboard.writeText(code)
      .then(() => {
        button.classList.add('copy-button--success');
        setTimeout(() => {
          button.classList.remove('copy-button--success');
        }, 2000);
      })
      .catch(() => {
        button.classList.add('copy-button--error');
        setTimeout(() => {
          button.classList.remove('copy-button--error');
        }, 2000);
      });
  }

  private unescapeHtml(value: string): string {
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
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
      const displayLang = language || 'code';
      const escapedCode = this.escapeHtml(token.text);
      // Generate animation-ready HTML with dual-icon structure
      return `<details class="code-block">
        <summary class="code-block__header">
          <span class="code-block__lang">${displayLang}</span>
          <button type="button" class="code-block__copy copy-button" data-code="${escapedCode}" title="Copy code" aria-label="Copy code">
            <span class="copy-button__icon copy-button__icon--idle">
              <i class="fa-regular fa-copy"></i>
            </span>
            <span class="copy-button__icon copy-button__icon--success">
              <i class="fa-solid fa-check"></i>
            </span>
          </button>
        </summary>
        <pre><code class="hljs ${className}">${highlighted}</code></pre>
      </details>`;
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

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
