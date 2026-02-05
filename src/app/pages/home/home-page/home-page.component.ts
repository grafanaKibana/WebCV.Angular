import { Component } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';

@Component({
  selector: 'app-home-pages',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  animations: [
    trigger('sectionAnimation', [
      transition(':enter', [
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
export class HomePageComponent {
}
