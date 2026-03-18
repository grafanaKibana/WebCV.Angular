import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HeaderComponent } from './header.component';
import { WebGLGradientService } from '../../services/webgl-gradient.service';
import { HomeDataService } from '../../services/home-data.service';
import { CvDownloadService } from '../../services/cv-download.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        {
          provide: WebGLGradientService,
          useValue: {
            getSavedThemeName: () => undefined,
            getDefaultThemeName: () => 'Green Teal',
            applyAccentColor: () => {},
            getNextThemeName: () => undefined,
            saveThemeName: () => {},
            getColorScheme: () => [],
            transitionGradientColors: () => {},
            applyGradient: () => {}
          }
        },
        {
          provide: HomeDataService,
          useValue: {
            getHeaderConfig: () => of({ isBlogDone: true, isDownloadCVDone: true })
          }
        },
        {
          provide: CvDownloadService,
          useValue: {
            downloadCv: () => of(undefined)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load header config on init', () => {
    expect(component.headerReady).toBe(true);
    expect(component.isBlogDone).toBe(true);
    expect(component.isDownloadCVDone).toBe(true);
  });
});
