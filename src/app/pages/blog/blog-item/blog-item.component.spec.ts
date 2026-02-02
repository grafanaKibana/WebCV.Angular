import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { BlogItemComponent } from './blog-item.component';
import { ArticleModel } from '../interfaces/articleModel';

describe('BlogItemComponent', () => {
  let component: BlogItemComponent;
  let fixture: ComponentFixture<BlogItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogItemComponent ],
      imports: [RouterTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogItemComponent);
    component = fixture.componentInstance;
    const article: ArticleModel = {
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
    component.article = article;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
