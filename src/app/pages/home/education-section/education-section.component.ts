import { Component, OnInit } from '@angular/core';
import { EducationModel } from '../interfaces/educationModel';
import { HomeDataService } from '../../../services/home-data.service';

@Component({
  selector: 'app-education-section',
  templateUrl: './education-section.component.html',
  styleUrls: ['./education-section.component.scss']
})
export class EducationSectionComponent implements OnInit {
  educationList: Array<EducationModel> = [];

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getEducation().subscribe({
      next: (data: EducationModel[]) => {
        this.educationList = data;
      },
      error: (error) => {
        console.error('Error loading education data:', error);
      }
    });
  }
}
