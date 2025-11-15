import { Component, OnInit } from '@angular/core';
import { HomeDataService, SidebarInfo } from '../../services/home-data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  sidebarInfo: SidebarInfo = {
    firstName: '',
    lastName: '',
    positionTitle: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    telegram: '',
    links: {
      gitHubLink: '',
      linkedInLink: '',
      repositoryLink: ''
    }
  };

  links = {
    gitHubLink: '',
    linkedInLink: '',
    repositoryLink: ''
  };

  constructor(private homeDataService: HomeDataService) {}

  ngOnInit(): void {
    this.homeDataService.getSidebarInfo().subscribe({
      next: (data: SidebarInfo) => {
        this.sidebarInfo = data;
        this.links = data.links;
      },
      error: (error) => {
        console.error('Error loading sidebar data:', error);
      }
    });
  }
}

