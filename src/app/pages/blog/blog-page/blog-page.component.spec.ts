import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BlogPageComponent } from './blog-page.component';
import { BlogDataService } from '../services/blog-data.service';

describe('BlogPageComponent', () => {
  let component: BlogPageComponent;
  let fixture: ComponentFixture<BlogPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: BlogDataService,
          useValue: { getArticles: () => of([]) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set articlesReady after articles load', () => {
    expect(component.articlesReady()).toBe(true);
  });
});
