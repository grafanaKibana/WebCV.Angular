import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
  @Input() article!: ArticleModel;
  imageLoaded = false;

  onImageLoaded(): void {
    this.imageLoaded = true;
  }
}
