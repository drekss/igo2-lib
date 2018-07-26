import { Injectable, Optional } from '@angular/core';

import { ConfigService } from '@igo2/core';

import {
  DataSource,
  OSMDataSource,
  FeatureDataSource,
  XYZDataSource,
  WFSDataSource,
  WMTSDataSource,
  WMSDataSource
} from '../../datasource';

import {
  Layer,
  ImageLayer,
  ImageLayerContext,
  TileLayer,
  TileLayerContext,
  VectorLayer,
  VectorLayerContext
} from './layers';

import { StyleService } from './style.service';

export type AnyLayerContext =
  | ImageLayerContext
  | TileLayerContext
  | VectorLayerContext;

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private tokenKey: string;

  constructor(
    private styleService: StyleService,
    @Optional() private config: ConfigService
  ) {
    if (this.config) {
      this.tokenKey = this.config.getConfig('auth.tokenKey');
    }
  }

  createLayer(dataSource: DataSource, context: AnyLayerContext): Layer {
    let layer;
    switch (dataSource.constructor) {
      case OSMDataSource:
      case WMTSDataSource:
      case XYZDataSource:
        layer = this.createTileLayer(dataSource, context as TileLayerContext);
        break;
      case FeatureDataSource:
      case WFSDataSource:
        layer = this.createVectorLayer(
          dataSource,
          context as VectorLayerContext
        );
        break;
      case WMSDataSource:
        layer = this.createImageLayer(dataSource, context as ImageLayerContext);
        break;
      default:
        break;
    }

    return layer;
  }

  private createImageLayer(
    dataSource: DataSource,
    context: ImageLayerContext
  ): ImageLayer {
    context = context || {};
    if (this.tokenKey) {
      context.token = localStorage.getItem(this.tokenKey);
    }

    return new ImageLayer(dataSource, context);
  }

  private createTileLayer(
    dataSource: DataSource,
    context: TileLayerContext
  ): TileLayer {
    return new TileLayer(dataSource, context);
  }

  private createVectorLayer(
    dataSource: DataSource,
    context: VectorLayerContext
  ): VectorLayer {
    let style;
    if (context.style !== undefined) {
      style = this.styleService.createStyle(context.style);
    }

    const layerOptions = Object.assign({}, context, {
      style: style
    });

    return new VectorLayer(dataSource, layerOptions);
  }
}
