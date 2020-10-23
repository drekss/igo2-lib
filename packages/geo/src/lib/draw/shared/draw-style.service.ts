import { Injectable } from '@angular/core';

import * as olstyle from 'ol/style';

@Injectable({
    providedIn: 'root'
  })
export class DrawStyleService {

    private fillColor: string;
    private strokeColor: string;
    private drawCounter: number = 1;

    constructor() {}

    getFill(): string {
        return this.fillColor;
    }

    setFill(fillColor: string) {
        this.fillColor = fillColor;
    }

    getStroke(): string {
        return this.strokeColor;
    }

    setStroke(strokeColor: string) {
        this.strokeColor = strokeColor;
    }

    getDrawCount() {
      return this.drawCounter;
    }

    raiseDrawCounter() {
      this.drawCounter = this.drawCounter + 1;
    }

    createDrawLayerStyle(): olstyle.Style {
        return new olstyle.Style({
          text: new olstyle.Text({
            text: 'gfdsgfsd'
          }),
          stroke: new olstyle.Stroke({
            color: this.strokeColor,
            width: 2
          }),
          fill:  new olstyle.Fill({
            color: this.fillColor
          }),
          image: new olstyle.Circle({
            radius: 5,
            stroke: new olstyle.Stroke({
              color: this.strokeColor
            }),
            fill: new olstyle.Fill({
              color: this.fillColor
            })
          })
        });
    }

    createDrawingInteractionStyle(): olstyle.Style {
      return new olstyle.Style({
        stroke: new olstyle.Stroke({
          color: this.strokeColor,
        }),
        fill:  new olstyle.Fill({
          color: this.fillColor
        }),
        image: new olstyle.Circle({
          radius: 5,
          stroke: new olstyle.Stroke({
            color: this.strokeColor
          }),
          fill: new olstyle.Fill({
            color: this.fillColor
          })
        })
      });
    }
}
