import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  sidebarInfo = {
    firstName: 'Nikita',
    lastName: 'Reshetnik',
    positionTitle: 'AI Engineer + .NET Developer',
    city: 'Kyiv',
    country: 'Ukraine',
    email: 'reshetnik.nikita@gmail.com',
    phone: '+38(068)752-14-48',
    telegram: '@reshetnigram',
  }

  links = {
    gitHubLink: 'https://github.com/grafanaKibana',
    linkedInLink: 'https://www.linkedin.com/in/nikitareshetnik/',
    repositoryLink: 'https://github.com/grafanaKibana/WebCV.Angular',
  }
}

