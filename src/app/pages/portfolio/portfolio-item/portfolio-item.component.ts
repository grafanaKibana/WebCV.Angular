import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import type { ProjectModel } from '../interfaces/projectModel';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ModalDialogComponent } from '../../../shared/modal-dialog/modal-dialog.component';

@Component({
  selector: 'app-portfolio-item[project]',
  standalone: true,
  templateUrl: './portfolio-item.component.html',
  styleUrls: ['./portfolio-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioItemComponent {
  @Input() project!: ProjectModel;
  private readonly dialog = inject(MatDialog);
  private readonly sso = inject(ScrollStrategyOptions);

  openProjectDetails(project: ProjectModel) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = project;
    dialogConfig.panelClass = 'dialog';
    dialogConfig.maxWidth = '';
    dialogConfig.scrollStrategy = this.sso.block();
    this.dialog.open(ModalDialogComponent, dialogConfig);
  }
}
