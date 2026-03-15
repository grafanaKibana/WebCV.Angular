import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { BlogDataService } from '../services/blog-data.service';
import { ArticleModel } from '../interfaces/articleModel';
import { BlogItemComponent } from '../blog-item/blog-item.component';

@Component({
  selector: 'app-blog-page',
  standalone: true,
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
  articlesReady = false;
  listAnimationTick = 0;
  private readonly blogDataService = inject(BlogDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.articles$ = this.blogDataService.getArticles();
    this.articles$
      .pipe(take(1))
      .subscribe(() => {
        this.articlesReady = true;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.listAnimationTick += 1;
          this.cdr.markForCheck();
        }, 0);
      });
  }

  trackById(index: number, article: ArticleModel): number {
    return article.id;
  }
}
