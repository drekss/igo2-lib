import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatTooltipModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatDividerModule
} from '@angular/material';
import { ColorPickerModule } from 'ngx-color-picker';

import { IgoLanguageModule } from '@igo2/core';
import { IgoEntityTableModule } from '@igo2/common';
import { DrawerComponent } from './drawer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * @ignore
 */
@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    IgoLanguageModule,
    IgoEntityTableModule,
    ColorPickerModule
  ],
  declarations: [
    DrawerComponent
  ],
  exports: [
    DrawerComponent
  ],
  entryComponents: [
  ]
})
export class IgoDrawerModule {}
