import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
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
export class BlogPageComponent {
  private readonly blogDataService = inject(BlogDataService);
  readonly articles$: Observable<ArticleModel[]> = this.blogDataService.getArticles();
  private readonly articlesSignal = toSignal(this.articles$);
  readonly articlesReady = computed(() => this.articlesSignal() !== undefined);

  trackById(_index: number, article: ArticleModel): number {
    return article.id;
  }
}
