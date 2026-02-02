import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { jest } from '@jest/globals';
import { PortfolioItemComponent } from './portfolio-item.component';
import type { ProjectModel } from '../interfaces/projectModel';

describe('PortfolioItemComponent', () => {
  let component: PortfolioItemComponent;
  let fixture: ComponentFixture<PortfolioItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortfolioItemComponent ],
      providers: [
        { provide: MatDialog, useValue: { open: jest.fn() } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioItemComponent);
    component = fixture.componentInstance;
    const project: ProjectModel = {
      id: 1,
      name: 'Sample project',
      summary: 'Short summary',
      description: 'Details',
      technologies: ['Angular'],
      imagePath: 'https://picsum.photos/seed/project/1200/630'
    };
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
