import { Component, Input } from '@angular/core';
import { ArticleModel } from '../interfaces/articleModel';

@Component({
  selector: 'app-blog-item[article]',
  templateUrl: './blog-item.component.html',
  styleUrls: ['./blog-item.component.scss']
})
export class BlogItemComponent {
  @Input() article!: ArticleModel;
}
