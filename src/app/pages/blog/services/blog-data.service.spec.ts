import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { BlogDataService } from './blog-data.service';

const MOCK_INDEX = `- posts/first-post.md
* posts/second-post.md
`;

const MOCK_POST_1 = `---
id: 1
headline: "First Post"
publishDate: "2024-06-15"
imagePath: "./hero.jpg"
author:
  name: "John Doe"
  title: "Writer"
  avatarUrl: "https://example.com/avatar.jpg"
---

# Hello World

This is the first post content.
`;

const MOCK_POST_2 = `---
id: 2
headline: "Second Post"
publishDate: "2024-07-20"
imagePath: "https://external.com/image.jpg"
author:
  name: "Jane Smith"
  title: "Editor"
  avatarUrl: "https://example.com/jane.jpg"
---

# Second Article

More content here.
`;

describe('BlogDataService', () => {
  let service: BlogDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BlogDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushArticles(indexContent: string = MOCK_INDEX, posts: Record<string, string> = {}): void {
    const indexReq = httpMock.expectOne('assets/data/blog/index.md');
    indexReq.flush(indexContent);

    const pendingRequests = httpMock.match(() => true);
    pendingRequests.forEach(req => {
      const url = req.request.url;
      if (posts[url]) {
        req.flush(posts[url]);
      } else if (url.includes('first-post')) {
        req.flush(MOCK_POST_1);
      } else if (url.includes('second-post')) {
        req.flush(MOCK_POST_2);
      } else {
        req.flush(MOCK_POST_1);
      }
    });
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch and parse articles from index', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(2);
        done();
      }
    });

    flushArticles();
  });

  it('should sort articles by date descending (newest first)', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles[0].headline).toBe('Second Post');
        expect(articles[1].headline).toBe('First Post');
        done();
      }
    });

    flushArticles();
  });

  it('should parse both - and * list markers in index', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(2);
        done();
      }
    });

    flushArticles();
  });

  it('should ignore empty lines and non-list items in index', (done) => {
    const indexWithNoise = `
# Blog Index

- posts/first-post.md

Some text that is not a list
`;

    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        done();
      }
    });

    const indexReq = httpMock.expectOne('assets/data/blog/index.md');
    indexReq.flush(indexWithNoise);

    const postReq = httpMock.expectOne((r) => r.url.includes('first-post'));
    postReq.flush(MOCK_POST_1);
  });

  it('should cache articles after first fetch', (done) => {
    let callCount = 0;

    service.getArticles().subscribe({
      next: () => { callCount++; }
    });
    service.getArticles().subscribe({
      next: () => {
        callCount++;
        expect(callCount).toBe(2);
        done();
      }
    });

    flushArticles();
  });

  it('should parse front matter scalars correctly', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        const first = articles.find(a => a.id === 1);
        expect(first).toBeTruthy();
        expect(first!.headline).toBe('First Post');
        expect(first!.publishDate).toBeInstanceOf(Date);
        done();
      }
    });

    flushArticles();
  });

  it('should parse nested author object', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        const first = articles.find(a => a.id === 1);
        expect(first!.author.name).toBe('John Doe');
        expect(first!.author.title).toBe('Writer');
        expect(first!.author.avatarUrl).toBe('https://example.com/avatar.jpg');
        done();
      }
    });

    flushArticles();
  });

  it('should resolve relative image paths against source directory', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        const first = articles.find(a => a.id === 1);
        expect(first!.imagePath).toBe('assets/data/blog/posts/hero.jpg');
        done();
      }
    });

    flushArticles();
  });

  it('should keep external image URLs as-is', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        const second = articles.find(a => a.id === 2);
        expect(second!.imagePath).toBe('https://external.com/image.jpg');
        done();
      }
    });

    flushArticles();
  });

  it('should use filename as slug', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        const first = articles.find(a => a.id === 1);
        expect(first!.slug).toBe('first-post');
        done();
      }
    });

    flushArticles();
  });

  it('should find article by slug (case-insensitive)', (done) => {
    service.getArticleBySlug('First-Post').subscribe({
      next: (article) => {
        expect(article).toBeTruthy();
        expect(article!.id).toBe(1);
        done();
      }
    });

    flushArticles();
  });

  it('should filter out posts without front matter', (done) => {
    const postWithoutFrontMatter = `# Just a plain markdown file

No front matter here.
`;

    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        expect(articles[0].headline).toBe('Second Post');
        done();
      }
    });

    const indexReq = httpMock.expectOne('assets/data/blog/index.md');
    indexReq.flush(MOCK_INDEX);

    const reqs = httpMock.match(() => true);
    reqs.forEach(req => {
      if (req.request.url.includes('first-post')) {
        req.flush(postWithoutFrontMatter);
      } else {
        req.flush(MOCK_POST_2);
      }
    });
  });

  it('should filter out posts that fail to load', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        expect(articles[0].headline).toBe('Second Post');
        done();
      }
    });

    const indexReq = httpMock.expectOne('assets/data/blog/index.md');
    indexReq.flush(MOCK_INDEX);

    const reqs = httpMock.match(() => true);
    reqs.forEach(req => {
      if (req.request.url.includes('first-post')) {
        req.error(new ProgressEvent('Network error'));
      } else {
        req.flush(MOCK_POST_2);
      }
    });
  });

  it('should return empty array when index fails to load', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles).toEqual([]);
        done();
      }
    });

    httpMock.expectOne('assets/data/blog/index.md').error(new ProgressEvent('Network error'));
  });

  it('should return empty array when index has no list items', (done) => {
    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles).toEqual([]);
        done();
      }
    });

    httpMock.expectOne('assets/data/blog/index.md').flush('# Empty index\n\nNo posts here.');
  });

  it('should handle posts with missing required fields', (done) => {
    const postMissingId = `---
headline: "No ID Post"
publishDate: "2024-01-01"
---

Content without id.
`;

    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        expect(articles[0].headline).toBe('Second Post');
        done();
      }
    });

    const indexReq = httpMock.expectOne('assets/data/blog/index.md');
    indexReq.flush(MOCK_INDEX);

    const reqs = httpMock.match(() => true);
    reqs.forEach(req => {
      if (req.request.url.includes('first-post')) {
        req.flush(postMissingId);
      } else {
        req.flush(MOCK_POST_2);
      }
    });
  });

  it('should resolve paths starting with assets/ as-is', (done) => {
    const indexWithAbsPath = '- assets/data/blog/posts/absolute.md\n';
    const post = `---
id: 10
headline: "Absolute Path Post"
publishDate: "2024-01-01"
imagePath: ""
---

Content.
`;

    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        done();
      }
    });

    httpMock.expectOne('assets/data/blog/index.md').flush(indexWithAbsPath);
    httpMock.expectOne('assets/data/blog/posts/absolute.md').flush(post);
  });

  it('should resolve paths starting with / by removing the leading slash', (done) => {
    const indexWithSlashPath = '- /data/blog/posts/slashed.md\n';
    const post = `---
id: 11
headline: "Slashed Path Post"
publishDate: "2024-01-01"
imagePath: ""
---

Content.
`;

    service.getArticles().subscribe({
      next: (articles) => {
        expect(articles.length).toBe(1);
        done();
      }
    });

    httpMock.expectOne('assets/data/blog/index.md').flush(indexWithSlashPath);
    httpMock.expectOne('data/blog/posts/slashed.md').flush(post);
  });
});
