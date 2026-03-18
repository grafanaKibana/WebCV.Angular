import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { HomeDataService } from '../../../services/home-data.service';
import type { EducationModel } from '../interfaces/educationModel';

@Component({
  selector: 'app-education-section',
  standalone: true,
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducationSectionComponent {
  readonly educationList = toSignal(
    inject(HomeDataService).getEducation().pipe(
      catchError((error) => {
        console.error('Error loading education data:', error);
        return of([] as EducationModel[]);
      })
    ),
    { initialValue: [] as EducationModel[] }
  );
}
