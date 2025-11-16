import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, ChildrenOutletContexts } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { webglConfig } from './config/webgl-config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({
            position: 'absolute',
            left: 0,
            width: '100%',
            opacity: 0,
            transform: 'translateY(20px)'
          })
        ], { optional: true }),
        query(':enter', [
          animate('400ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          )
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'webcv-angular';

  constructor(
    private router: Router,
    private contexts: ChildrenOutletContexts
  ) {
    // Scroll to top on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  ngOnInit(): void {
    // Initialize CSS custom properties from configuration
    this.initializeWebGLConfig();
  }

  /**
   * Initialize CSS custom properties from webgl-config.ts
   * This syncs TypeScript configuration with CSS variables
   */
  private initializeWebGLConfig(): void {
    const root = document.documentElement;
    const reflection = webglConfig.reflection;

    // Set reflection opacity values
    root.style.setProperty('--reflection-opacity-base', reflection.opacityBase.toString());
    root.style.setProperty('--reflection-opacity-subtle', reflection.opacitySubtle.toString());
    root.style.setProperty('--reflection-opacity-strong', reflection.opacityStrong.toString());

    // Set reflection gradient stops
    root.style.setProperty('--reflection-gradient-start', `${reflection.gradientStops.start}%`);
    root.style.setProperty('--reflection-gradient-subtle', `${reflection.gradientStops.subtle}%`);
    root.style.setProperty('--reflection-gradient-mid', `${reflection.gradientStops.mid}%`);
    root.style.setProperty('--reflection-gradient-end', `${reflection.gradientStops.end}%`);
    root.style.setProperty('--reflection-gradient-transparent', `${reflection.gradientStops.transparent}%`);

    // Set transition duration
    root.style.setProperty('--reflection-transition-duration', `${reflection.transitionDuration}s`);
  }

  getRouteAnimationData(): string {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] || 'HomePage';
  }
}
