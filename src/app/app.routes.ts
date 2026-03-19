import type { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page/home-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent, data: { animation: 'HomePage' } },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog/blog-detail-page/blog-detail-page.component').then(
        (m) => m.BlogDetailPageComponent
      ),
    data: { animation: 'BlogDetailPage' }
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./pages/blog/blog-page/blog-page.component').then(
        (m) => m.BlogPageComponent
      ),
    data: { animation: 'BlogPage' },
    pathMatch: 'full'
  }
];
