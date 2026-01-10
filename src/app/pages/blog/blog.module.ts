import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPageComponent } from './blog-page/blog-page.component';
import { BlogItemComponent } from './blog-item/blog-item.component';
import { BlogDetailPageComponent } from './blog-detail-page/blog-detail-page.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    BlogPageComponent,
    BlogItemComponent,
    BlogDetailPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class BlogModule { }
