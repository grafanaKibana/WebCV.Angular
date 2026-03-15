import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeDataService, AboutMeData } from '../../../services/home-data.service';

@Component({
  selector: 'app-about-me-section',
  standalone: true,
  templateUrl: './about-me-section.component.html',
  styleUrls: ['./about-me-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutMeSectionComponent implements OnInit, OnDestroy {
  aboutMe: AboutMeData = {
    content: ''
  };
  private readonly destroy$ = new Subject<void>();
  private readonly homeDataService = inject(HomeDataService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.homeDataService.getAboutMe()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AboutMeData) => {
          this.aboutMe = data;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading about me data:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
