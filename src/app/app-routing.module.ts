import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page/home-page.component';
import { BlogPageComponent } from './pages/blog/blog-page/blog-page.component';
import { PortfolioPageComponent } from './pages/portfolio/portfolio-page/portfolio-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent, data: { animation: 'HomePage' } },
  { path: 'portfolio', component: PortfolioPageComponent, data: { animation: 'PortfolioPage' } },
  { path: 'blog', component: BlogPageComponent, data: { animation: 'BlogPage' } }
]



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
