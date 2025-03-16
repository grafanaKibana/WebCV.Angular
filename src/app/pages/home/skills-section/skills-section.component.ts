import { Component, OnInit } from '@angular/core';
import { SkillModel } from '../interfaces/skillModel';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.component.html',
  styleUrls: ['./skills-section.component.scss']
})
export class SkillsSectionComponent implements OnInit {

  skills: Map<string, Array<SkillModel>> = new Map([
    ['Languages', [
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
    ]],
    ['Data Storage', [
      {
        technology: 'MS SQL Server',
        level: 2
      },
      {
        technology: 'ElasticSearch',
        level: 1
      }
    ]],
    ['Technologies', [
      {
        technology: 'ASP.NET Web API',
        level: 3
      },
      {
        technology: 'Entity Framework',
        level: 2
      }
    ]],
    ['Cloud', [
      {
        technology: 'Azure',
        level: 2
      },
      {
        technology: 'AWS',
        level: 1
      }
    ]],
    ['AI', [
      {
        technology: 'Semantic Kernel + OpenAI',
        level: 3
      },
      {
        technology: 'Prompt Engineering',
        level: 1
      }
    ]],
    ['Other', [
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
    ]]
  ]);

  constructor() { }

  ngOnInit(): void {
  }

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

  // Add this method to preserve original order
  originalOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0; // returning 0 will keep the original order
  }
}
