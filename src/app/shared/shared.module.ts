import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { HeaderModule } from './header/header.module';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HorizontalSeparatorComponent } from './horizontal-separator/horizontal-separator.component';
import { VerticalSeparatorComponent } from './vertical-separator/vertical-separator.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    FooterComponent,
    SidebarComponent,
    HorizontalSeparatorComponent,
    VerticalSeparatorComponent,
    ModalDialogComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    HeaderModule,
    FooterComponent,
    SidebarComponent,
    HorizontalSeparatorComponent,
    VerticalSeparatorComponent,
    MatDialogModule,
    ModalDialogComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FontAwesomeModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    HeaderModule,
  ]
})
export class SharedModule {
}
