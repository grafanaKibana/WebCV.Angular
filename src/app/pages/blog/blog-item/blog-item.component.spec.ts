import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BlogItemComponent } from './blog-item.component';
import { ArticleModel } from '../interfaces/articleModel';

describe('BlogItemComponent', () => {
  let component: BlogItemComponent;
  let fixture: ComponentFixture<BlogItemComponent>;

  const mockArticle: ArticleModel = {
    id: 1,
    slug: 'test-article',
    headline: 'Test article',
    content: '',
    publishDate: new Date('2024-01-01'),
    imagePath: 'https://picsum.photos/seed/test/1200/630',
    author: {
      name: 'Test Author',
      title: 'Writer',
      avatarUrl: 'https://i.pravatar.cc/150?img=12'
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogItemComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BlogItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('article', mockArticle);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with imageLoaded as false', () => {
    expect(component.imageLoaded).toBe(false);
  });

  it('should set imageLoaded to true when onImageLoaded is called', () => {
    component.onImageLoaded();
    expect(component.imageLoaded).toBe(true);
  });
});
