import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebGLBackgroundComponent } from './webgl-background.component';

@NgModule({
  declarations: [
    WebGLBackgroundComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    WebGLBackgroundComponent
  ]
})
export class WebGLBackgroundModule { } 