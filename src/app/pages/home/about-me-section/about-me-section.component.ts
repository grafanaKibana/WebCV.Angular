import { Component, OnInit } from '@angular/core';
import { HomeDataService, AboutMeData } from '../../../services/home-data.service';

@Component({
  selector: 'app-about-me-section',
  templateUrl: './about-me-section.component.html',
  styleUrls: ['./about-me-section.component.scss']
})
export class AboutMeSectionComponent implements OnInit {
  aboutMe: AboutMeData = {
    content: ''
  };

  constructor(private homeDataService: HomeDataService) { }

  ngOnInit(): void {
    this.homeDataService.getAboutMe().subscribe({
      next: (data: AboutMeData) => {
        this.aboutMe = data;
      },
      error: (error) => {
        console.error('Error loading about me data:', error);
      }
    });
  }
}
