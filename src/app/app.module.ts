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
import { MeshGradientDirective } from './directives/mesh-gradient.directive';
import { BackgroundComponent } from './shared/background/background.component';

@NgModule({
  declarations: [
    AppComponent,
    MeshGradientDirective,
    BackgroundComponent,
  ],
  imports: [
    BrowserModule,
    SharedModule,
    RouterModule,
    AppRoutingModule,
    HomeModule,
    PortfolioModule,
    BlogModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
