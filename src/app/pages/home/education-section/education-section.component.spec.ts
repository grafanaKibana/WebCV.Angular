import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EducationSectionComponent } from './education-section.component';
import { HomeDataService } from '../../../services/home-data.service';

const mockEducation = [
  {
    educationalInstitution: 'MIT',
    degree: 'BSc',
    speciality: 'Computer Science',
    startYear: '2015',
    endYear: '2019',
    description: 'Test description'
  }
];

describe('EducationSectionComponent', () => {
  let component: EducationSectionComponent;
  let fixture: ComponentFixture<EducationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationSectionComponent],
      providers: [
        {
          provide: HomeDataService,
          useValue: { getEducation: () => of(mockEducation) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EducationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load education data on init', () => {
    expect(component.educationList()).toEqual(mockEducation);
  });
});
