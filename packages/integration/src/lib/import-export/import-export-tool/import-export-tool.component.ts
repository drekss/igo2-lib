import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { IgoMap } from '@igo2/geo';

import { MapState } from '../../map/map.state';

@ToolComponent({
  name: 'importExport',
  title: 'igo.integration.tools.importExport',
  icon: 'file-move'
})
@Component({
  selector: 'igo-import-export-tool',
  templateUrl: './import-export-tool.component.html',
  styleUrls: ['./import-export-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportExportToolComponent {
  /**
   * Map to measure on
   * @internal
   */
  get map(): IgoMap { return this.mapState.map; }

  public importExportType$: string = 'data';
  @Output() itemTypeChange = new EventEmitter<string>();

  constructor(
    private mapState: MapState,
  ) {}

  importExportTypeChange(event) {
    this.importExportType$ = event.value;
    this.itemTypeChange.emit(this.importExportType$);
  }
}
