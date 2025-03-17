import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';
import { HeaderColorSchemeSelectorModule } from './header-color-scheme-selector/header-color-scheme-selector.module';

@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    HeaderColorSchemeSelectorModule
  ],
  exports: [
    HeaderComponent
  ]
})
export class HeaderModule { } 