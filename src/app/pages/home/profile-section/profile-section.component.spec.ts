import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProfileSectionComponent } from './profile-section.component';
import { HomeDataService, SidebarInfo } from '../../../services/home-data.service';

const mockSidebarInfo: SidebarInfo = {
  firstName: 'John',
  lastName: 'Doe',
  positionTitle: 'Engineer',
  city: 'Kyiv',
  country: 'Ukraine',
  email: 'test@test.com',
  phone: '+1234',
  telegram: '@test',
  links: {
    gitHubLink: 'https://github.com/test',
    linkedInLink: 'https://linkedin.com/test',
    repositoryLink: 'https://github.com/test/repo'
  }
};

describe('ProfileSectionComponent', () => {
  let component: ProfileSectionComponent;
  let fixture: ComponentFixture<ProfileSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSectionComponent],
      providers: [
        {
          provide: HomeDataService,
          useValue: { getSidebarInfo: () => of(mockSidebarInfo) }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sidebar info on init', () => {
    expect(component.profileReady).toBe(true);
    expect(component.sidebarInfo).toEqual(mockSidebarInfo);
    expect(component.links).toEqual(mockSidebarInfo.links);
  });
});
