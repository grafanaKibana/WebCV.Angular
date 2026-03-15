import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SkillGroupModel } from '../interfaces/skillModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsSectionComponent implements OnInit, OnDestroy {
  skills: Array<SkillGroupModel> = [];
  skillRows: SkillGroupModel[][] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly columnsPerRow = 4;
  private readonly homeDataService = inject(HomeDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getSkills()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: SkillGroupModel[]) => {
          this.skills = data;
          this.skillRows = [];
          for (let i = 0; i < data.length; i += this.columnsPerRow) {
            this.skillRows.push(data.slice(i, i + this.columnsPerRow));
          }
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading skills data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
