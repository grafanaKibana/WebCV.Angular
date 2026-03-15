import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { BlogPageComponent } from './blog-page.component';
import { BlogItemComponent } from '../blog-item/blog-item.component';
import { BlogDataService } from '../services/blog-data.service';

describe('BlogPageComponent', () => {
  let component: BlogPageComponent;
  let fixture: ComponentFixture<BlogPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlogPageComponent, BlogItemComponent ],
      imports: [RouterTestingModule, NoopAnimationsModule],
      providers: [
        {
          provide: BlogDataService,
          useValue: { getArticles: () => of([]) }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
