import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Tool } from '../shared';

@Component({
  selector: 'igo-toolbar-item',
  templateUrl: './toolbar-item.component.html',
  styleUrls: ['./toolbar-item.component.styl']
})
export class ToolbarItemComponent {

  @Input()
  get tool(): Tool { return this._tool; }
  set tool(value: Tool) {
    this._tool = value;
  }
  private _tool: Tool;

  @Input()
  get withTitle() { return this._withTitle; }
  set withTitle(value: boolean) {
    this._withTitle = value;
  }
  private _withTitle: boolean = true;

  @Input()
  get withIcon() { return this._withIcon; }
  set withIcon(value: boolean) {
    this._withIcon = value;
  }
  private _withIcon: boolean = true;

  @Input()
  get tooltip() { return this._tooltip; }
  set tooltip(value: string) {
    this._tooltip = value;
  }
  private _tooltip: string;

  @Output() select: EventEmitter<Tool> = new EventEmitter();

  constructor() { }

}