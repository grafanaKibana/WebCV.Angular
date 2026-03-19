import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HomeDataService } from '../../../services/home-data.service';
import type { SkillGroupModel } from '../interfaces/skillModel';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsSectionComponent {
  private readonly SKILL_LEVEL_NAMES: Record<number, string> = {
    3: 'Advanced',
    2: 'Intermediate',
    1: 'Novice',
  };

  readonly skills = toSignal(
    inject(HomeDataService).getSkills().pipe(
      catchError((error) => {
        console.error('Error loading skills data:', error);
        return of([] as SkillGroupModel[]);
      })
    ),
    { initialValue: [] as SkillGroupModel[] }
  );

  getTagBasis(skillCount: number): string {
    const perRow = Math.ceil(skillCount / 2);
    if (perRow <= 1) return '100%';
    return `calc((100% - ${perRow - 1} * var(--spacing-2)) / ${perRow})`;
  }

  getSkillLevelName(level: number): string {
    return this.SKILL_LEVEL_NAMES[level] ?? 'Unknown';
  }
}
