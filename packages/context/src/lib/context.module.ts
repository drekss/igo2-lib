import { NgModule, ModuleWithProviders } from '@angular/core';
import {
  MatInputModule,
  MatFormFieldModule
} from '@angular/material';

import { IgoContextManagerModule } from './context-manager/context-manager.module';
import { IgoContextMapButtonModule } from './context-map-button/context-map-button.module';
import { IgoShareMapModule } from './share-map/share-map.module';
import { IgoSidenavModule } from './sidenav/sidenav.module';
import { IgoContextImportExportModule } from './context-import-export/context-import-export.module';

@NgModule({
  imports: [
    MatInputModule,
    MatFormFieldModule],
  declarations: [],
  exports: [
    IgoContextImportExportModule,
    IgoContextManagerModule,
    IgoContextMapButtonModule,
    IgoShareMapModule,
    IgoSidenavModule
  ]
})
export class IgoContextModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextModule,
      providers: []
    };
  }
}
