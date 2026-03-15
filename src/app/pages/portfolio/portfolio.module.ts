import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ModalDialogComponent } from '../../shared/modal-dialog/modal-dialog.component';
import { PortfolioPageComponent } from './portfolio-page/portfolio-page.component';
import { PortfolioItemComponent } from './portfolio-item/portfolio-item.component';


@NgModule({
  declarations: [
    PortfolioPageComponent,
    PortfolioItemComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ]
})
export class PortfolioModule { }
