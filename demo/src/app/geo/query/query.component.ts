import { Component } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import olFeature from 'ol/Feature';
import olPoint from 'ol/geom/Point';
import olPolygon from 'ol/geom/Polygon';
import olLineString from 'ol/geom/LineString';
import * as olproj from 'ol/proj';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  FeatureDataSource,
  DataSourceService,
  LayerService,
  OverlayService,
  Feature
} from '@igo2/geo';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class AppQueryComponent {
  public feature$ = new BehaviorSubject<Feature>(undefined);

  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private overlayService: OverlayService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'wms',
        url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
        params: {
          layers: 'bgr_v_sous_route_res_sup_act',
          version: '1.3.0'
        }
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'WMS',
            source: dataSource
          })
        );
      });

    this.dataSourceService
      .createAsyncDataSource({
        type: 'vector'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Vector Layer',
            source: dataSource
          })
        );
        this.addFeatures(dataSource as FeatureDataSource);
      });
  }

  addFeatures(dataSource: FeatureDataSource) {
    const feature1 = new olFeature({
      name: 'feature1',
      geometry: new olLineString([
        olproj.transform([-72, 47.8], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-73.5, 47.4], 'EPSG:4326', 'EPSG:3857'),
        olproj.transform([-72.4, 48.6], 'EPSG:4326', 'EPSG:3857')
      ])
    });

    const feature2 = new olFeature({
      name: 'feature2',
      geometry: new olPoint(
        olproj.transform([-73, 46.6], 'EPSG:4326', 'EPSG:3857')
      )
    });

    const feature3 = new olFeature({
      name: 'feature3',
      geometry: new olPolygon([
        [
          olproj.transform([-71, 46.8], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-73, 47], 'EPSG:4326', 'EPSG:3857'),
          olproj.transform([-71.2, 46.6], 'EPSG:4326', 'EPSG:3857')
        ]
      ])
    });

    dataSource.ol.addFeatures([feature1, feature2, feature3]);
  }

  handleQueryResults(results) {
    const features: Feature[] = results.features;
    let feature;
    if (features.length) {
      feature = features[0];
    }
    this.feature$.next(feature);
  }
}