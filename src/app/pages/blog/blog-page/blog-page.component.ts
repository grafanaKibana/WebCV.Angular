import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogDataService } from '../services/blog-data.service';
import { ArticleModel } from '../interfaces/articleModel';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss']
})
export class BlogPageComponent implements OnInit {
  articles$!: Observable<ArticleModel[]>;

  constructor(private blogDataService: BlogDataService) {}

  ngOnInit(): void {
    this.articles$ = this.blogDataService.getArticles();
  }

  trackById(index: number, article: ArticleModel): number {
    return article.id;
  }
}
