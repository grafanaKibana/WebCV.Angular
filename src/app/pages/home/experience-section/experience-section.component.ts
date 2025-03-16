import { Component, OnInit } from '@angular/core';
import { ExperienceModel } from '../interfaces/experienceModel';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-experience-section',
  templateUrl: './experience-section.component.html',
  styleUrls: ['./experience-section.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({height: '0px', opacity: '0'}),
        animate('.4s ease-out', style({height: '*'})),
        animate('.25s linear', style({opacity: '1'})),
      ]),
      transition(':leave', [
        animate('.25s linear', style({opacity: '0'})),
        animate('.4s ease-in', style({height: '0px'})),
      ])
    ])
  ]
})
export class ExperienceSectionComponent implements OnInit {

  experienceList: Array<ExperienceModel> = [
    {
      positionTitle: 'AI Integration Engineer',
      company: 'ELEKS',
      startMonth: 'November',
      startYear: '2024',
      endMonth: '',
      endYear: '',
      description: {
        responsibilities: [
          'Designed and delivered LLM-based microservice for an enterprise-grade time management legal platform, significantly enhancing capabilities for law firms and professional services.',
          'Led a new cross-functional team, organizing Agile ceremonies and maintaining clear communication with QA, MLOps, Data Science, DevOps, and Product stakeholders.',
          'Introduced internal documentation and wikis, including a newcomer dashboard, ensuring knowledge sharing and efficient onboarding.'
        ],
        aboutProject: 'Enterprise time-management platform used by major law firms to streamline billing and analytics.',
        toolsAndTechnologies: ''
      }
    },
    {
      positionTitle: 'Software Engineer',
      company: 'ELEKS',
      startMonth: 'December',
      startYear: '2023',
      endMonth: 'December',
      endYear: '2024',
      description: {
        responsibilities: [
          'Delivered numerous end-to-end features and bug fixes spanning RESTful microservices, a monolithic application, plugin packages, and the desktop client.',
          'Developed and optimized complex SQL queries for efficient data retrieval, manipulation, and reporting. Collaborated with database engineers to refine query execution plans and improve overall database performance.',
          'Conducted in-depth code reviews and proactively refactored legacy code, enhancing maintainability and aligning with modern .NET standards.',
          'Took an active role in agile processes such as planning, daily stand-ups, and retrospectives. Led these activities on rotational basics.',
          'Collaborated with QA and DevOps teams on release processes, swiftly resolving deployment issues and ensuring smooth rollouts.'
        ],
        aboutProject: 'Enterprise time-management platform used by major law firms to streamline billing and analytics.',
        toolsAndTechnologies: ''
      }
    },
    {
      positionTitle: 'Junior Software Engineer',
      company: 'ELEKS',
      startMonth: 'September',
      startYear: '2021',
      endMonth: 'December',
      endYear: '2023',
      description: {
        responsibilities: [
          'Delivered features and bug fixes across RESTful API microservices, a monolithic app, plug-in packages, ensuring seamless integration of system components with each other.',
          'Conducted code reviews, providing feedback on peers\' pull requests and engaging in pair programming for complex tasks.',
          'Contributed to the technical support tickets, investigated and resolved client-specific issues requiring technical and domain knowledge.',
          'Created and maintained dev wikis covering environment setup, app installation, and API documentation to ease onboarding for future newcomers. Curated a shared SQL query library to streamline team investigations and data generation.'
        ],
        aboutProject: 'Enterprise time-management platform used by major law firms to streamline billing and analytics.',
        toolsAndTechnologies: ''
      }
    },
    {
      positionTitle: 'Trainee Software Engineer',
      company: 'ELEKS',
      startMonth: 'September',
      startYear: '2021',
      endMonth: 'December',
      endYear: '2023',
      description: {
        responsibilities: [
          'Delivered basic yet critical RESTful API tasks and small bug fixes under supervision, ensuring smooth integration with other team components.',
          'Collaborated with senior developers to adopt modern .NET practices and understand project architecture.',
          'Quickly ramped up on the time-management/legal domain, taking on small API tasks and bug fixes.',
          'Created and updated dev wikis covering environment setup and project guidelines, easing onboarding for future newcomers.',
        ],
        aboutProject: 'Enterprise time-management platform used by major law firms to streamline billing and analytics.',
        toolsAndTechnologies: ''
      }
    },
    {
      positionTitle: 'Software Engineering Intern',
      company: 'Sigma Software',
      startMonth: 'March',
      startYear: '2021',
      endMonth: 'April',
      endYear: '2021',
      description: {
        responsibilities: [
          'Developed a full-stack car rental application in a team of intern developers, utilizing UML diagrams for front-end and back-end design.',
          'Designed the front-end using Figma mockups, implementing a responsive and user-friendly interface.',
          'Achieved 80%+ unit/integration test coverage on the Back-End, ensuring code reliability and maintainability.'
        ],
        aboutProject: 'Full-stack car rental application, aiming to gain hands-on experience in building an enterprise-level application from scratch.',
        toolsAndTechnologies: ''
      }
    }
  ]
  allToggles: Array<boolean> = new Array(this.experienceList.length).fill(false)

  constructor() { }

  ngOnInit(): void {  }

  public toggleShow(index: number): void {
    if (!this.allToggles[index]) {
      this.allToggles = this.allToggles.map(_ => false)
      this.allToggles[index] = !this.allToggles[index]
    }
    else {
      this.allToggles[index] = !this.allToggles[index]
    }

  }

  calculateDuration(startMonth: string, startYear: string, endMonth: string | null, endYear: string | null): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const startMonthIndex = months.indexOf(startMonth);
    const startYearNum = parseInt(startYear);
    
    let endMonthIndex: number;
    let endYearNum: number;
    
    if (endMonth && endYear) {
      endMonthIndex = months.indexOf(endMonth);
      endYearNum = parseInt(endYear);
    } else {
      // If no end date (current job), use current date
      const currentDate = new Date();
      endMonthIndex = currentDate.getMonth();
      endYearNum = currentDate.getFullYear();
    }
    
    // Calculate total months between dates
    let totalMonths = (endYearNum - startYearNum) * 12 + (endMonthIndex - startMonthIndex);
    
    // Convert to years and months
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    // Format the result
    let result = '';
    if (years > 0) {
      result += `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    if (remainingMonths > 0) {
      if (result.length > 0) {
        result += ' ';
      }
      result += `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    
    return result;
  }
}
