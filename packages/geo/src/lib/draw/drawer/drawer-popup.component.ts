import { Component, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'drawer-popup-component',
    templateUrl: './drawer-popup.component.html',
    styleUrls: ['./drawer-popup.component.scss'],
  })
  export class DrawerPopupComponent {
  
    public title: string;
    public message: string;
    onOk$: BehaviorSubject<string> = new BehaviorSubject('');
    constructor(public dialog: MatDialogRef<DrawerPopupComponent>) {
        this.title = 'Label';
        this.message = 'Veuillez entrer le label';
     }
  }