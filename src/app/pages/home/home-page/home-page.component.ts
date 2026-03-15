import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { take, takeUntil, finalize } from 'rxjs/operators';
import { HomeDataService } from '../../../services/home-data.service';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';
import { AboutMeSectionComponent } from '../about-me-section/about-me-section.component';
import { EducationSectionComponent } from '../education-section/education-section.component';
import { ExperienceSectionComponent } from '../experience-section/experience-section.component';
import { SkillsSectionComponent } from '../skills-section/skills-section.component';

@Component({
  selector: 'app-home-pages',
  standalone: true,
  imports: [SidebarComponent, AboutMeSectionComponent, EducationSectionComponent, ExperienceSectionComponent, SkillsSectionComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly homeDataService = inject(HomeDataService);
  private readonly cdr = inject(ChangeDetectorRef);

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
        this.cdr.markForCheck();
        requestAnimationFrame(() => {
          this.sectionAnimationTick += 1;
          this.cdr.markForCheck();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.documentElement.classList.remove('home-prehide');
  }
}
