import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HomePageComponent } from './home-page.component';
import { HomeData, HomeDataService } from '../../../services/home-data.service';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
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
        links: {
          gitHubLink: '',
          linkedInLink: '',
          repositoryLink: ''
        }
      },
      aboutMe: {
        content: ''
      },
      education: [],
      experience: [],
      skills: [],
      header: {
        isPortfolioDone: false,
        isBlogDone: false,
        isDownloadCVDone: false
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ HomePageComponent ],
      imports: [CommonModule, NoopAnimationsModule],
      providers: [
        {
          provide: HomeDataService,
          useValue: {
            getHomeData: () => of(homeDataStub)
          }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
