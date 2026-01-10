import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ArticleData, ArticleModel } from '../interfaces/articleModel';

interface BlogData {
  articles: ArticleData[];
}

@Injectable({
  providedIn: 'root'
})
export class BlogDataService {
  private readonly dataPath = 'assets/data/blog-data.json';
  private articles$?: Observable<ArticleModel[]>;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<ArticleModel[]> {
    if (!this.articles$) {
      this.articles$ = this.http.get<BlogData>(this.dataPath).pipe(
        map(data => data.articles.map(article => this.normalizeArticle(article))),
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

  getArticleById(articleId: number): Observable<ArticleModel | undefined> {
    return this.getArticles().pipe(
      map(articles => articles.find(article => article.id === articleId))
    );
  }

  private normalizeArticle(article: ArticleData): ArticleModel {
    return {
      ...article,
      publishDate: new Date(article.publishDate)
    };
  }
}
