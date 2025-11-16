import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, ChildrenOutletContexts } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trigger, transition, style, animate, query } from '@angular/animations';

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
export class AppComponent {
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

  getRouteAnimationData(): string {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] || 'HomePage';
  }
}
