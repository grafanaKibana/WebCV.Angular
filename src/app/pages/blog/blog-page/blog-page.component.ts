import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
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
    animations: [
        trigger('blogItemsAnimation', [
            transition('* => *', [
                query('app-blog-item', [
                    style({ transform: 'translateY(16px)' }),
                    stagger(90, [
                        animate('420ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ transform: 'translateY(0)' }))
                    ])
                ], { optional: true })
            ])
        ])
    ]
})
export class BlogPageComponent implements OnInit {
  articles$!: Observable<ArticleModel[]>;
  readonly articlesReady = signal(false);
  readonly listAnimationTick = signal(0);
  private readonly blogDataService = inject(BlogDataService);

  ngOnInit(): void {
    this.articles$ = this.blogDataService.getArticles();
    this.articles$
      .pipe(take(1))
      .subscribe(() => {
        this.articlesReady.set(true);
        setTimeout(() => {
          this.listAnimationTick.update((value) => value + 1);
        }, 0);
      });
  }

  trackById(_index: number, article: ArticleModel): number {
    return article.id;
  }
}
