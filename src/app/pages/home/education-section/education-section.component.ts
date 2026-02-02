import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EducationModel } from '../interfaces/educationModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-education-section',
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.scss']
})
export class EducationSectionComponent implements OnInit, OnDestroy {
  educationList: Array<EducationModel> = [];
  private readonly destroy$ = new Subject<void>();

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getEducation()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: EducationModel[]) => {
          this.educationList = data;
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
