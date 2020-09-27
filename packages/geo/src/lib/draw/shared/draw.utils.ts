import { LanguageService } from '@igo2/core';
import * as olstyle from 'ol/style';
import OlGeometry from 'ol/geom/Geometry';
import OlPoint from 'ol/geom/Point';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';
import OlOverlay from 'ol/Overlay';
import { getCenter as olGetCenter } from 'ol/extent';
import {
  getLength as olGetLength,
  getArea as olGetArea
} from 'ol/sphere';

import { Draw } from './draw.interface';

export function createDrawLayerStyle(fill?: string, stroke?: string): olstyle.Style {
    return new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: stroke ? stroke : '#ffcc33',
        width: 2
      }),
      fill: new olstyle.Fill({
        color: fill ? fill : 'rgba(255, 255, 255, 0.2)'
      }),
      text: new olstyle.Text({
        text: '4'
      })
    });
}

/**
 * Create a default style for a measure interaction
 * @returns OL style
 */
export function createDrawingInteractionStyle(fill?: olstyle.Fill, stroke?: olstyle.stroke): olstyle.Style {
  return new olstyle.Style({
    stroke: new olstyle.Stroke({
      color: stroke ? stroke : '',
    }),
    fill:  new olstyle.Fill({
      color: fill ? fill : ''
    }),
    image: new olstyle.Circle({
      radius: 5,
      stroke: new olstyle.Stroke({
        color: stroke ? stroke : '',
      }),
      fill: new olstyle.Fill({
        color: fill ? fill : ''
      })
    })
  });
}
