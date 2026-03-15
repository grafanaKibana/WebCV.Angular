import { Component, OnDestroy, OnInit } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { take, takeUntil, finalize } from 'rxjs/operators';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-home-pages',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations: [
    trigger('sectionAnimation', [
      transition('* => *', [
        query('app-about-me-section, app-education-section, app-experience-section, app-skills-section', [
          style({ transform: 'translateY(16px)' }),
          stagger(80, [
            animate('420ms cubic-bezier(0.22, 0.61, 0.36, 1)', style({ transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomePageComponent implements OnInit, OnDestroy {
  homeReady = false;
  sectionAnimationTick = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    document.documentElement.classList.add('home-prehide');

    this.homeDataService.getHomeData()
      .pipe(
        take(1),
        takeUntil(this.destroy$),
        finalize(() => document.documentElement.classList.remove('home-prehide'))
      )
      .subscribe(() => {
        this.homeReady = true;
        requestAnimationFrame(() => {
          this.sectionAnimationTick += 1;
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.documentElement.classList.remove('home-prehide');
  }
}
