import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal, type OnInit } from '@angular/core';
import type { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { BlogItemComponent } from '../blog-item/blog-item.component';
import type { ArticleModel } from '../interfaces/articleModel';
import { BlogDataService } from '../services/blog-data.service';

@Component({
    selector: 'app-blog-page',
    imports: [BlogItemComponent, AsyncPipe],
    templateUrl: './blog-page.component.html',
    styleUrls: ['./blog-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPageComponent implements OnInit {
  articles$!: Observable<ArticleModel[]>;
  readonly articlesReady = signal(false);
  private readonly blogDataService = inject(BlogDataService);

  ngOnInit(): void {
    this.articles$ = this.blogDataService.getArticles();
    this.articles$
      .pipe(take(1))
      .subscribe(() => {
        this.articlesReady.set(true);
      });
  }

  trackById(_index: number, article: ArticleModel): number {
    return article.id;
  }
}
