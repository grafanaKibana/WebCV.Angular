import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ExperienceSectionComponent } from './experience-section.component';
import { HomeDataService } from '../../../services/home-data.service';
import { ExperienceModel } from '../interfaces/experienceModel';

const mockExperience: ExperienceModel[] = [
  {
    positionTitle: 'Senior Dev',
    company: 'Corp A',
    startMonth: 'January',
    startYear: '2020',
    endMonth: null,
    endYear: null,
    description: { responsibilities: ['code'], aboutProject: 'proj', toolsAndTechnologies: 'TS' }
  },
  {
    positionTitle: 'Junior Dev',
    company: 'Corp B',
    startMonth: 'March',
    startYear: '2018',
    endMonth: 'December',
    endYear: '2019',
    description: { responsibilities: ['test'], aboutProject: 'proj2', toolsAndTechnologies: 'JS' }
  }
];

describe('ExperienceSectionComponent', () => {
  let component: ExperienceSectionComponent;
  let fixture: ComponentFixture<ExperienceSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceSectionComponent, NoopAnimationsModule],
      providers: [
        {
          provide: HomeDataService,
          useValue: { getExperience: () => of(mockExperience) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExperienceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load experience data on init', () => {
    expect(component.experienceList).toEqual(mockExperience);
    expect(component.allToggles).toEqual([false, false]);
  });

  describe('toggleShow', () => {
    it('should open an item when toggled', () => {
      component.toggleShow(0);
      expect(component.allToggles[0]).toBe(true);
      expect(component.allToggles[1]).toBe(false);
    });

    it('should close an item when toggled again', () => {
      component.toggleShow(0);
      component.toggleShow(0);
      expect(component.allToggles[0]).toBe(false);
    });

    it('should close previous item when opening a new one', () => {
      component.toggleShow(0);
      expect(component.allToggles[0]).toBe(true);

      component.toggleShow(1);
      expect(component.allToggles[0]).toBe(false);
      expect(component.allToggles[1]).toBe(true);
    });
  });

  describe('toIsoDate', () => {
    it('should return year-MM when month is provided', () => {
      expect(component.toIsoDate('2020', 'January')).toBe('2020-01');
      expect(component.toIsoDate('2020', 'December')).toBe('2020-12');
    });

    it('should return just year when month is null', () => {
      expect(component.toIsoDate('2020', null)).toBe('2020');
    });

    it('should return just year when month is undefined', () => {
      expect(component.toIsoDate('2020', undefined)).toBe('2020');
    });

    it('should fall back to 01 for unknown month', () => {
      expect(component.toIsoDate('2020', 'InvalidMonth')).toBe('2020-01');
    });
  });
});
