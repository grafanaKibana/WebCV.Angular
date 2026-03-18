import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { BlogDetailPageComponent } from './blog-detail-page.component';
import { BlogDataService } from '../services/blog-data.service';
import { HomeDataService } from '../../../services/home-data.service';

describe('BlogDetailPageComponent', () => {
  let component: BlogDetailPageComponent;
  let fixture: ComponentFixture<BlogDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogDetailPageComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ slug: 'test-article' })) }
        },
        {
          provide: BlogDataService,
          useValue: { getArticleBySlug: () => of(undefined) }
        },
        {
          provide: HomeDataService,
          useValue: {
            getSidebarInfo: () => of({
              firstName: 'Test',
              lastName: 'User',
              positionTitle: 'Dev',
              city: '',
              country: '',
              email: '',
              phone: '',
              telegram: '',
              links: { gitHubLink: '', linkedInLink: '', repositoryLink: '' }
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BlogDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set articleLoaded to true after init', () => {
    expect(component.articleLoaded()).toBe(true);
  });
});
