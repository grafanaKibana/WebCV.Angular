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
    switch (level) {
      case 3:
        return 'Advanced'
      case 2:
        return 'Intermediate'
      case 1:
        return 'Novice'
      default:
        return 'Unknown'
    }
  }
}
