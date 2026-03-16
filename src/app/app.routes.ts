import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page/home-page.component';
import { BlogPageComponent } from './pages/blog/blog-page/blog-page.component';
import { BlogDetailPageComponent } from './pages/blog/blog-detail-page/blog-detail-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, data: { animation: 'HomePage' } },
  { path: 'blog/:slug', component: BlogDetailPageComponent, data: { animation: 'BlogDetailPage' } },
  { path: 'blog', component: BlogPageComponent, data: { animation: 'BlogPage' }, pathMatch: 'full' }
];
