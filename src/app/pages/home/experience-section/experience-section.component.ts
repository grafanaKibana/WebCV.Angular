import { Component, OnInit } from '@angular/core';
import { ExperienceModel } from '../interfaces/experienceModel';
import { HomeDataService } from '../../../services/home-data.service';
import { animate, style, transition, trigger, group } from '@angular/animations';

@Component({
  selector: 'app-experience-section',
  templateUrl: './experience-section.component.html',
  styleUrls: ['./experience-section.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition('void => *', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        group([
          animate('100ms ease-in', style({ height: '*' })),
          animate('300ms ease-in', style({ opacity: 1 }))
        ])
      ]),
      transition('* => void', [
        group([
          animate('100ms ease-out', style({ height: 0, overflow: 'hidden' })),
          animate('200ms ease-out', style({ opacity: 0 }))
        ])
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
