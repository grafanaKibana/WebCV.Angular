import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EducationModel } from '../interfaces/educationModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-education-section',
  standalone: true,
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EducationSectionComponent implements OnInit, OnDestroy {
  educationList: Array<EducationModel> = [];
  private readonly destroy$ = new Subject<void>();
  private readonly homeDataService = inject(HomeDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getEducation()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: EducationModel[]) => {
          this.educationList = data;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading education data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
