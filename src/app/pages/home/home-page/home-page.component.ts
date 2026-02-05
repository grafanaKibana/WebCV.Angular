import { Component } from '@angular/core';
import { trigger, transition, query, style, stagger, animate, group } from '@angular/animations';

@Component({
  selector: 'app-home-pages',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations: [
    trigger('sectionAnimation', [
      transition(':enter', [
        query('app-about-me-section, app-education-section, app-experience-section, app-skills-section', [
          style({ transform: 'translateY(30px)' }),
          stagger(100, [
            group([
              animate('500ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ transform: 'translateY(0)' })),
              query('section > *', [
                style({ opacity: 0 }),
                animate('400ms 100ms ease-out', style({ opacity: 1 }))
              ], { optional: true })
            ])
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomePageComponent {
}
