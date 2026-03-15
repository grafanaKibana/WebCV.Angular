import { Component, OnInit } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { BlogDataService } from '../services/blog-data.service';
import { ArticleModel } from '../interfaces/articleModel';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss'],
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

  constructor(private blogDataService: BlogDataService) {}

  ngOnInit(): void {
    this.articles$ = this.blogDataService.getArticles();
    this.articles$
      .pipe(take(1))
      .subscribe(() => {
        this.articlesReady = true;
        setTimeout(() => {
          this.listAnimationTick += 1;
        }, 0);
      });
  }

  trackById(index: number, article: ArticleModel): number {
    return article.id;
  }
}
