import { Component, OnInit } from '@angular/core';
import { SkillGroupModel } from '../interfaces/skillModel';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent {
  skills: Array<SkillGroupModel> = [
      {
        name: 'Languages',
        skills: [
          {
            technology: '.NET / C#',
            level: 3
          },
          {
            technology: 'T-SQL',
            level: 2
          },
          {
            technology: 'Python',
            level: 1
          }
        ]
      },
      {
        name: 'Data Storage',
        skills: [
          {
            technology: 'MS SQL Server',
            level: 2
          },
          {
            technology: 'ElasticSearch',
            level: 1
          }
        ]
      },
      {
        name: 'Technologies',
        skills: [
          {
            technology: 'ASP.NET Web API',
            level: 3
          },
          {
            technology: 'Entity Framework',
            level: 2
          }
        ]
      },
      {
        name: 'Cloud',
        skills: [
          {
            technology: 'Azure',
            level: 2
          },
          {
            technology: 'AWS',
            level: 1
          }
        ]
      },
      {
        name: 'AI',
        skills: [
          {
            technology: 'Semantic Kernel + OpenAI',
            level: 3
          },
          {
            technology: 'Prompt Engineering',
            level: 1
          }
        ]
      },
      {
        name: 'Other',
        skills: [
          {
            technology: 'Grafana',
            level: 2
          },
          {
            technology: 'Kibana',
            level: 2
          },
          {
            technology: 'ArgoCD',
            level: 1
          },
          {
            technology: 'Jenkins',
            level: 2
          },
          {
            technology: 'Git',
            level: 2
          },
          {
            technology: 'UML',
            level: 1
          }
        ]
      }
    ];

  getSkillLevelName(level:number) {
    switch (level) {
      case 3:
        return 'Advanced'
      case 2:
        return 'Intermediate'
      case 1:
        return 'Novice'
      default:
        return 'Unknown'
    }
  }
}
