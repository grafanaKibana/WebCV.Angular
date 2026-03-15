import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeDataService, AboutMeData } from '../../../services/home-data.service';

@Component({
  selector: 'app-about-me-section',
  templateUrl: './about-me-section.component.html',
  styleUrls: ['./about-me-section.component.scss']
})
export class AboutMeSectionComponent implements OnInit, OnDestroy {
  aboutMe: AboutMeData = {
    content: ''
  };
  private readonly destroy$ = new Subject<void>();

  constructor(private homeDataService: HomeDataService) { }

  ngOnInit(): void {
    this.homeDataService.getAboutMe()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AboutMeData) => {
          this.aboutMe = data;
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
