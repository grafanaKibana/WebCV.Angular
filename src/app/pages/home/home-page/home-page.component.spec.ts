import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HomePageComponent } from './home-page.component';
import { HomeData, HomeDataService } from '../../../services/home-data.service';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  const homeDataStub: HomeData = {
    sidebar: {
      firstName: '',
      lastName: '',
      positionTitle: '',
      city: '',
      country: '',
      email: '',
      phone: '',
      telegram: '',
      links: { gitHubLink: '', linkedInLink: '', repositoryLink: '' }
    },
    aboutMe: { content: '' },
    education: [],
    experience: [],
    skills: [],
    header: { isBlogDone: false, isDownloadCVDone: false }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePageComponent, NoopAnimationsModule],
      providers: [
        {
          provide: HomeDataService,
          useValue: {
            getHomeData: () => of(homeDataStub),
            getSidebarInfo: () => of(homeDataStub.sidebar),
            getAboutMe: () => of(homeDataStub.aboutMe),
            getEducation: () => of(homeDataStub.education),
            getExperience: () => of(homeDataStub.experience),
            getSkills: () => of(homeDataStub.skills),
            getHeaderConfig: () => of(homeDataStub.header)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set homeReady to true after data loads', () => {
    expect(component.homeReady()).toBe(true);
  });

  it('should not throw when component is destroyed', () => {
    expect(() => fixture.destroy()).not.toThrow();
  });
});
