import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SharedModule } from "./shared/shared.module";
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HomeModule } from './pages/home/home.module';
import { PortfolioModule } from './pages/portfolio/portfolio.module';
import { BlogModule } from './pages/blog/blog.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebGLBackgroundModule } from './shared/webgl-background/webgl-background.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    RouterModule,
    AppRoutingModule,
    HomeModule,
    PortfolioModule,
    BlogModule,
    BrowserAnimationsModule,
    WebGLBackgroundModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
