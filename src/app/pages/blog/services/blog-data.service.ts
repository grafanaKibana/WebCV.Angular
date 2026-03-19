import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import {
  ArticleAuthor,
  ArticleData,
  ArticleModel
} from '../interfaces/articleModel';

@Injectable({
  providedIn: 'root'
})
export class BlogDataService {
  private readonly indexPath = 'assets/data/blog/index.md';
  private readonly postsBasePath = 'assets/data/blog/';
  private articles$?: Observable<ArticleModel[]>;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<ArticleModel[]> {
    if (!this.articles$) {
      this.articles$ = this.http.get(this.indexPath, { responseType: 'text' }).pipe(
        map(indexMarkdown => this.parseIndex(indexMarkdown)),
        switchMap(postPaths => this.loadPosts(postPaths)),
        map(articles => articles.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())),
        catchError(error => {
          console.error('Error loading blog data:', error);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.articles$;
  }

  getArticleBySlug(slug: string): Observable<ArticleModel | undefined> {
    const normalizedSlug = this.normalizeSlug(slug);
    return this.getArticles().pipe(
      map(articles => articles.find(article => this.normalizeSlug(article.slug) === normalizedSlug))
    );
  }

  private normalizeArticle(article: ArticleData): ArticleModel {
    return {
      ...article,
      publishDate: new Date(article.publishDate)
    };
  }

  private parseIndex(indexMarkdown: string): string[] {
    return indexMarkdown
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.startsWith('- ') || line.startsWith('* '))
      .map(line => line.slice(2).trim())
      .filter(Boolean)
      .map(path => this.resolvePostPath(path));
  }

  private resolvePostPath(path: string): string {
    if (path.startsWith('assets/')) {
      return path;
    }
    if (path.startsWith('/')) {
      return path.slice(1);
    }
    return `${this.postsBasePath}${path}`;
  }

  private resolveImagePath(imagePath: string, sourcePath: string): string {
    // If empty, external URL, or already absolute path, return as-is
    if (!imagePath || imagePath.startsWith('http') || imagePath.startsWith('./assets/') || imagePath.startsWith('assets/')) {
      return imagePath;
    }

    // Get the directory of the source markdown file
    const sourceDir = sourcePath.substring(0, sourcePath.lastIndexOf('/') + 1);

    // Handle relative paths (e.g., "./hero.jpg" or "hero.jpg")
    const cleanPath = imagePath.startsWith('./') ? imagePath.slice(2) : imagePath;
    return `${sourceDir}${cleanPath}`;
  }

  private loadPosts(postPaths: string[]): Observable<ArticleModel[]> {
    if (!postPaths.length) {
      return of([]);
    }

    const requests = postPaths.map(path =>
      this.http.get(path, { responseType: 'text' }).pipe(
        map(markdown => this.parseMarkdownArticle(markdown, path)),
        catchError(error => {
          console.error(`Error loading blog post ${path}:`, error);
          return of(null);
        })
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.filter((article): article is ArticleData => article !== null)),
      map(articles => articles.map(article => this.normalizeArticle(article)))
    );
  }

  private parseMarkdownArticle(markdown: string, sourcePath: string): ArticleData | null {
    const { frontMatter, body } = this.splitFrontMatter(markdown);
    if (!frontMatter) {
      console.warn(`Missing front matter in blog post ${sourcePath}`);
      return null;
    }

    const metadata = this.parseFrontMatter(frontMatter);
    const id = Number(metadata['id']);
    const headline = typeof metadata['headline'] === 'string' ? metadata['headline'].trim() : '';
    if (!id || !headline) {
      console.warn(`Missing required metadata in blog post ${sourcePath}`);
      return null;
    }

    const slug = this.extractSlug(sourcePath, headline, id);
    const publishDate = typeof metadata['publishDate'] === 'string'
      ? metadata['publishDate'].trim()
      : new Date().toISOString().slice(0, 10);
    const rawImagePath = typeof metadata['imagePath'] === 'string' ? metadata['imagePath'].trim() : '';
    const imagePath = this.resolveImagePath(rawImagePath, sourcePath);
    const author = this.parseAuthor(metadata['author']);
    const content = body.trim();

    return {
      id,
      slug,
      headline,
      content,
      publishDate,
      imagePath,
      author
    };
  }

  private splitFrontMatter(markdown: string): { frontMatter: string; body: string } {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    if (lines[0]?.trim() !== '---') {
      return { frontMatter: '', body: markdown.trim() };
    }

    const endIndex = lines.slice(1).findIndex(line => line.trim() === '---');
    if (endIndex === -1) {
      return { frontMatter: '', body: markdown.trim() };
    }

    const frontMatterLines = lines.slice(1, endIndex + 1);
    const bodyLines = lines.slice(endIndex + 2);
    return {
      frontMatter: frontMatterLines.join('\n'),
      body: bodyLines.join('\n').trim()
    };
  }

  private parseFrontMatter(frontMatter: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    let currentKey: string | null = null;

    for (const line of frontMatter.split(/\r?\n/)) {
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      const indent = line.match(/^\s*/)?.[0].length ?? 0;
      const trimmed = line.trim();

      if (indent === 0) {
        currentKey = this.parseTopLevelFrontMatterKey(trimmed, result);
      } else if (currentKey) {
        this.parseNestedFrontMatterKey(trimmed, currentKey, result);
      }
    }

    return result;
  }

  private parseTopLevelFrontMatterKey(
    trimmed: string,
    result: Record<string, unknown>
  ): string | null {
    const match = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      return null;
    }

    const key = match[1];
    const rawValue = match[2];

    if (!rawValue) {
      result[key] = {};
      return key;
    }

    result[key] = this.parseScalarValue(rawValue);
    return null;
  }

  private parseNestedFrontMatterKey(
    trimmed: string,
    currentKey: string,
    result: Record<string, unknown>
  ): void {
    const nestedMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (nestedMatch && result[currentKey] && typeof result[currentKey] === 'object') {
      (result[currentKey] as Record<string, unknown>)[nestedMatch[1]] =
        this.parseScalarValue(nestedMatch[2]);
    }
  }

  private parseScalarValue(value: string): unknown {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const inner = trimmed.slice(1, -1).trim();
      if (!inner) {
        return [];
      }
      return inner.split(',').map(item => this.unquote(item.trim()));
    }

    const unquoted = this.unquote(trimmed);
    if (/^-?\d+(\.\d+)?$/.test(unquoted)) {
      return Number(unquoted);
    }
    if (unquoted === 'true') {
      return true;
    }
    if (unquoted === 'false') {
      return false;
    }
    return unquoted;
  }

  private unquote(value: string): string {
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  private parseAuthor(author: unknown): ArticleAuthor {
    const fallback: ArticleAuthor = {
      name: '',
      title: '',
      avatarUrl: ''
    };

    if (!author || typeof author !== 'object' || Array.isArray(author)) {
      return fallback;
    }

    const authorMap = author as Record<string, unknown>;
    return {
      name: typeof authorMap['name'] === 'string' ? authorMap['name'] : fallback.name,
      title: typeof authorMap['title'] === 'string' ? authorMap['title'] : fallback.title,
      avatarUrl: typeof authorMap['avatarUrl'] === 'string' ? authorMap['avatarUrl'] : fallback.avatarUrl
    };
  }

  private extractSlug(sourcePath: string, headline: string, id: number): string {
    const fileName = sourcePath.split('/').pop() ?? '';
    const sanitized = fileName.split('?')[0].split('#')[0];
    const base = sanitized.replace(/\.md$/i, '');
    if (base) {
      return base;
    }
    const fallback = this.slugify(headline);
    return fallback || `post-${id}`;
  }

  private normalizeSlug(slug: string): string {
    return decodeURIComponent(slug).trim().toLowerCase();
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

}
