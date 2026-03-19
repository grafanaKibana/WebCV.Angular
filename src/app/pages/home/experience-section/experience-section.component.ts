import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HomeDataService } from '../../../services/home-data.service';
import { DurationPipe } from '../../../shared/pipes/duration.pipe';
import { MonthShortPipe } from '../../../shared/pipes/month-short.pipe';
import { MONTH_TO_ISO } from '../../../shared/constants/months';
import type { ExperienceModel } from '../interfaces/experienceModel';

@Component({
    selector: 'app-experience-section',
    imports: [MonthShortPipe, DurationPipe],
    templateUrl: './experience-section.component.html',
    styleUrls: ['./experience-section.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceSectionComponent {
  private readonly homeDataService = inject(HomeDataService);
  readonly experienceList = toSignal(
    this.homeDataService.getExperience().pipe(
      catchError((error) => {
        console.error('Error loading experience data:', error);
        return of([] as ExperienceModel[]);
      })
    ),
    { initialValue: [] as ExperienceModel[] }
  );
  readonly allToggles = linkedSignal(() => new Array(this.experienceList().length).fill(false) as boolean[]);

  toggleShow(index: number): void {
    const current = this.allToggles();
    if (!current[index]) {
      this.allToggles.set(current.map((_, i) => i === index));
    } else {
      const next = [...current];
      next[index] = false;
      this.allToggles.set(next);
    }
  }

  toIsoDate(year: string, month?: string | null): string {
    if (!month) return year;
    return `${year}-${MONTH_TO_ISO[month] ?? '01'}`;
  }
}
