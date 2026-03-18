import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SkillsSectionComponent } from './skills-section.component';
import { HomeDataService } from '../../../services/home-data.service';
import { SkillGroupModel } from '../interfaces/skillModel';

const mockSkills: SkillGroupModel[] = [
  { name: 'Frontend', skills: [{ technology: 'Angular', level: 3 }, { technology: 'React', level: 2 }] },
  { name: 'Backend', skills: [{ technology: 'Node.js', level: 3 }] },
  { name: 'DevOps', skills: [{ technology: 'Docker', level: 2 }] },
  { name: 'Cloud', skills: [{ technology: 'Azure', level: 3 }] },
  { name: 'Testing', skills: [{ technology: 'Jest', level: 2 }] }
];

describe('SkillsSectionComponent', () => {
  let component: SkillsSectionComponent;
  let fixture: ComponentFixture<SkillsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsSectionComponent],
      providers: [
        {
          provide: HomeDataService,
          useValue: { getSkills: () => of(mockSkills) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load skills data', () => {
    expect(component.skills()).toEqual(mockSkills);
  });

  describe('getSkillLevelName', () => {
    it('should return Advanced for level 3', () => {
      expect(component.getSkillLevelName(3)).toBe('Advanced');
    });

    it('should return Intermediate for level 2', () => {
      expect(component.getSkillLevelName(2)).toBe('Intermediate');
    });

    it('should return Novice for level 1', () => {
      expect(component.getSkillLevelName(1)).toBe('Novice');
    });

    it('should return Unknown for level 0', () => {
      expect(component.getSkillLevelName(0)).toBe('Unknown');
    });

    it('should return Unknown for unexpected level', () => {
      expect(component.getSkillLevelName(99)).toBe('Unknown');
    });
  });

  describe('getTagBasis', () => {
    it('should return 100% for 1 skill', () => {
      expect(component.getTagBasis(1)).toBe('100%');
    });

    it('should return 100% for 2 skills (ceil(2/2) = 1 per row)', () => {
      expect(component.getTagBasis(2)).toBe('100%');
    });

    it('should return calc expression for 3 skills', () => {
      const result = component.getTagBasis(3);
      expect(result).toBe('calc((100% - 1 * var(--spacing-2)) / 2)');
    });

    it('should return calc expression for 6 skills', () => {
      const result = component.getTagBasis(6);
      expect(result).toBe('calc((100% - 2 * var(--spacing-2)) / 3)');
    });
  });
});
