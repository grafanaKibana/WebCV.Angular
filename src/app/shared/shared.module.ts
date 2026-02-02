import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule } from '@angular/forms';
// FontAwesomeModule removed - using CSS classes directly instead of <fa-icon> component

import { HeaderModule } from './header/header.module';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HorizontalSeparatorComponent } from './horizontal-separator/horizontal-separator.component';
import { VerticalSeparatorComponent } from './vertical-separator/vertical-separator.component';
import { ModalDialogComponent } from './modal-dialog/modal-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MonthShortPipe } from './pipes/month-short.pipe';
import { DurationPipe } from './pipes/duration.pipe';
import { IntroOverlayComponent } from './intro-overlay/intro-overlay.component';
import { CopyButtonComponent } from './components/copy-button/copy-button.component';

@NgModule({
  declarations: [
    FooterComponent,
    SidebarComponent,
    HorizontalSeparatorComponent,
    VerticalSeparatorComponent,
    ModalDialogComponent,
    IntroOverlayComponent,
    MonthShortPipe,
    DurationPipe,
    CopyButtonComponent,
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
    IntroOverlayComponent,
    MonthShortPipe,
    DurationPipe,
    CopyButtonComponent,
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    HeaderModule,
  ]
})
export class SharedModule {
}
