import { Component, OnInit } from '@angular/core';
import { ExperienceModel } from '../interfaces/experienceModel';
import { HomeDataService } from '../../../services/home-data.service';
import { animate, style, transition, trigger, state } from '@angular/animations';

@Component({
  selector: 'app-experience-section',
  templateUrl: './experience-section.component.html',
  styleUrls: ['./experience-section.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('false', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden',
        marginTop: '0',
        paddingTop: '0',
        paddingBottom: '0',
        transform: 'translateZ(0)',
        willChange: 'height, opacity, margin-top, padding-top, padding-bottom'
      })),
      state('true', style({
        height: '*',
        opacity: 1,
        overflow: 'visible',
        transform: 'translateZ(0)',
        willChange: 'auto'
      })),
      transition('false => true', [
        animate('350ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('true => false', [
        style({ 
          overflow: 'hidden',
          willChange: 'height, opacity, margin-top, padding-top, padding-bottom'
        }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class ExperienceSectionComponent implements OnInit {
  experienceList: Array<ExperienceModel> = [];
  allToggles: Array<boolean> = [];

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getExperience().subscribe({
      next: (data: ExperienceModel[]) => {
        this.experienceList = data;
        this.allToggles = new Array(this.experienceList.length).fill(false);
      },
      error: (error) => {
        console.error('Error loading experience data:', error);
      }
    });
  }

  toggleShow(index: number): void {
    if (!this.allToggles[index]) {
      this.allToggles = this.allToggles.map(_ => false);
      this.allToggles[index] = !this.allToggles[index];
    } else {
      this.allToggles[index] = !this.allToggles[index];
    }
  }
}
