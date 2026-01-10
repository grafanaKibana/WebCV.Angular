import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import {
  ArticleContentBlock,
  ArticleHeadingBlock,
  ArticleModel
} from '../interfaces/articleModel';
import { BlogDataService } from '../services/blog-data.service';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
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
  contentBlocks: ArticleContentBlock[] = [];
  tocItems: TocItem[] = [];
  readingTimeMinutes = 0;
  shareLinks: ShareLink[] = [];
  copyLabel = 'Copy link';

  private readonly destroy$ = new Subject<void>();
  private currentUrl = '';

  constructor(
    private route: ActivatedRoute,
    private blogDataService: BlogDataService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => this.blogDataService.getArticleById(Number(params.get('id')))),
        takeUntil(this.destroy$)
      )
      .subscribe(article => {
        this.article = article;
        if (!article) {
          this.contentBlocks = [];
          this.tocItems = [];
          this.shareLinks = [];
          return;
        }

        this.contentBlocks = this.addAnchors(article.content);
        this.tocItems = this.buildToc(this.contentBlocks);
        this.readingTimeMinutes = this.estimateReadingTime(article.content);
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
        setTimeout(() => {
          this.copyLabel = 'Copy link';
        }, 2000);
      })
      .catch(() => {
        this.copyLabel = 'Copy failed';
      });
  }

  private buildToc(blocks: ArticleContentBlock[]): TocItem[] {
    return blocks
      .filter((block): block is ArticleHeadingBlock => block.type === 'heading' && !!block.anchor)
      .map(block => ({
        id: block.anchor || '',
        text: block.text,
        level: block.level
      }));
  }

  private addAnchors(blocks: ArticleContentBlock[]): ArticleContentBlock[] {
    const anchors = new Map<string, number>();
    return blocks.map(block => {
      if (block.type !== 'heading') {
        return block;
      }

      const base = this.slugify(block.text);
      const count = (anchors.get(base) ?? 0) + 1;
      anchors.set(base, count);
      const anchor = count > 1 ? `${base}-${count}` : base;
      return { ...block, anchor };
    });
  }

  private estimateReadingTime(blocks: ArticleContentBlock[]): number {
    const words = blocks
      .map(block => this.extractText(block))
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
  }

  private extractText(block: ArticleContentBlock): string {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'quote':
        return block.text;
      case 'list':
        return block.items.join(' ');
      default:
        return '';
    }
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

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
