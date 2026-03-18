import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { DynamicReflectionService } from './services/dynamic-reflection.service';
import { SeoService } from './services/seo.service';
import { WebGLGradientService } from './services/webgl-gradient.service';
import { HomeDataService } from './services/home-data.service';
import { CvDownloadService } from './services/cv-download.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: DynamicReflectionService,
          useValue: { applyLastReflection: () => {}, updateReflectionColors: () => {}, destroy: () => {} }
        },
        {
          provide: SeoService,
          useValue: { updatePageMeta: () => {} }
        },
        {
          provide: WebGLGradientService,
          useValue: {
            getSavedThemeName: () => undefined,
            getDefaultThemeName: () => 'Green Teal',
            applyAccentColor: () => {},
            applyGradient: () => {},
            removeGradient: () => {},
            getThemeNames: () => [],
            getColorScheme: () => []
          }
        },
        {
          provide: HomeDataService,
          useValue: {
            getHomeData: () => of({ sidebar: {}, aboutMe: {}, education: [], experience: [], skills: [], header: { isBlogDone: false, isDownloadCVDone: false } }),
            getHeaderConfig: () => of({ isBlogDone: false, isDownloadCVDone: false }),
            getSidebarInfo: () => of({}),
            getAboutMe: () => of({}),
            getEducation: () => of([]),
            getExperience: () => of([]),
            getSkills: () => of([])
          }
        },
        {
          provide: CvDownloadService,
          useValue: { downloadCv: () => of(undefined) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'webcv-angular'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('webcv-angular');
  });

  it('should render wrapper', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.wrapper')).toBeTruthy();
  });
});
