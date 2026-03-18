import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleModel } from '../interfaces/articleModel';

@Component({
    selector: 'app-blog-item[article]',
    imports: [RouterLink, DatePipe],
    templateUrl: './blog-item.component.html',
    styleUrls: ['./blog-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogItemComponent {
  readonly article = input.required<ArticleModel>();
  imageLoaded = false;

  onImageLoaded(): void {
    this.imageLoaded = true;
  }
}
