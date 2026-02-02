import { Component, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, ChildrenOutletContexts } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { DynamicReflectionService } from './services/dynamic-reflection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter', [
          style({
            transform: 'translateY(20px)'
          }),
          animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            style({ transform: 'translateY(0)' })
          )
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnDestroy {
  title = 'webcv-angular';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private contexts: ChildrenOutletContexts,
    private dynamicReflectionService: DynamicReflectionService
  ) {
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.dynamicReflectionService.applyLastReflection();
      });

    // Scroll to top on route change
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const fragment = this.router.parseUrl(event.urlAfterRedirects).fragment;
        if (fragment) {
          return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        requestAnimationFrame(() => {
          this.dynamicReflectionService.applyLastReflection();
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRouteAnimationData(): string {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] || 'HomePage';
  }

  onRouteActivate(): void {
    requestAnimationFrame(() => {
      this.dynamicReflectionService.applyLastReflection();
    });
  }
}
