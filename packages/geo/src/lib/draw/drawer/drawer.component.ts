import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    ViewChild,
    Output
  } from '@angular/core';

import {
    FEATURE,
    FeatureStore,
    FeatureStoreLoadingStrategy,
    FeatureStoreSelectionStrategy,
    tryBindStoreLayer,
    tryAddLoadingStrategy,
    tryAddSelectionStrategy,
    Feature
  } from '../../feature';

import { LanguageService, AnalyticsOptions } from '@igo2/core';
import { MatDialog } from '@angular/material/dialog';
import { DrawType } from '../shared/draw.enum';
import { IgoMap } from '../../map/shared/map';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Draw, FeatureWithDraw } from '../shared/draw.interface';
import { FormGroup, FormBuilder } from '@angular/forms';
import { StyleService } from '../../layer/shared/style.service';
import { VectorSourceEvent as OlVectorSourceEvent } from 'ol/source/Vector';
import { LayerService } from '../../layer/shared/layer.service';
import { DataSourceService } from '../../datasource/shared/datasource.service';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { createDrawLayerStyle, createDrawingInteractionStyle } from '../shared/draw.utils';
import { DrawControl } from '../../geometry/shared/controls/draw';
import { EntityRecord, EntityTableTemplate, EntityTableComponent } from '@igo2/common';

import OlStyle from 'ol/style/Style';
import OlVectorSource from 'ol/source/Vector';
import OlPoint from 'ol/geom/Point';
import OlLineString from 'ol/geom/LineString';
import OlPolygon from 'ol/geom/Polygon';
import OlCircle from 'ol/geom/Circle';
import OlGeoJSON from 'ol/format/GeoJSON';
import OlOverlay from 'ol/Overlay';
import OlFeature from 'ol/Feature';
import { uuid } from '@igo2/utils';
import { DrawStyleService } from '../shared/draw-style.service';
import { skip } from 'rxjs/operators';
import { feature } from '@turf/helpers';
import { DrawerPopupComponent } from './drawer-popup.component';
import { getTooltipsOfOlGeometry } from '../../measure/shared/measure.utils';

@Component ({
    selector: 'igo-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class DrawerComponent implements OnInit, OnDestroy {

    /**
     * Table template
     * @internal
     */
    public tableTemplate: EntityTableTemplate = {
        selection: true,
        selectMany: true,
        selectionCheckbox: true,
        sort: true,
        columns: [
            {
                name: 'Drawing',
                title: this.languageService.translate.instant('igo.geo.draw.drawing'),
                valueAccessor: (feature: FeatureWithDraw) => {
                    return feature.properties.draw;
                }
            }
        ]
    };
    /**
     * Reference to the DrawType enum
     * @internal
     */
    public drawType = DrawType;

    @Output() fillColor: any;
    @Output() strokeColor: any;

    /**
     * The map to draw on
     */
    @Input() map: IgoMap;

    /**
     * Feature added listener key
     */
    private onFeatureAddedKey: string;

    /**
     * The measures store
     */
    @Input() store: FeatureStore<FeatureWithDraw>;

    /**
     * Observable of draw
     * @internal
     */
    public draw$: BehaviorSubject<Draw> = new BehaviorSubject({});

    /**
     * Draw type
     * @internal
     */
    @Input()
    set activeDrawType(value: DrawType) { this.setActiveDrawType(value); }
    get activeDrawType(): DrawType { return this._activeDrawType; }

    /**
     * Wheter one of the draw control is active
     * @internal
     */
    get drawControlIsActive(): boolean {
        return this.activeDrawControl !== undefined;
    }

    private _activeDrawType: DrawType = DrawType.Point;
    private drawingStyle: any;
    private drawControl: DrawControl;
    private activeDrawControl: DrawControl;
    private olDrawSource = new OlVectorSource();
    private drawPointControl: DrawControl;
    private drawLabel: string;
    private drawLineControl: DrawControl;
    private drawPolygonControl: DrawControl;
    private drawCircleControl: DrawControl;
    private drawStart$$: Subscription;
    private drawEnd$$: Subscription;
    private styleChange$$: Subscription;
    private activeOlGeometry: OlPoint | OlLineString | OlPolygon | OlCircle;
    private selectedFeatures$$: Subscription;
    public selectedFeatures$: BehaviorSubject<FeatureWithDraw[]> = new BehaviorSubject([]);
    public showTooltips: boolean = true;

    public position: string = 'bottom';
    public form: FormGroup;

    constructor(
        private languageService: LanguageService,
        private styleService: StyleService,
        private formBuilder: FormBuilder,
        private drawStyleService: DrawStyleService,
        private dialog: MatDialog
    ) {
        this.buildForm();
        this.fillColor = this.drawStyleService.getFill();
        this.strokeColor = this.drawStyleService.getStroke();
    }

    ngOnInit() {
        this.initStore();
        this.onToggleTooltips(this.showTooltips);
        this.createDrawPointControl();
        this.createDrawLineControl();
        this.createDrawPolygonControl();
        this.createDrawCircleControl();
        this.toggleDrawControl();
    }

    /**
     * Clear the overlay layer and any interaction added by this component.
     * @internal
     */
    ngOnDestroy() {
        this.setActiveDrawType(undefined);
    }

    createDrawPointControl(fill?: string, stroke?: string) {
        this.drawPointControl = new DrawControl({
            // à changer
            geometryType: DrawType.Point,
            source: this.olDrawSource,
            layerStyle: new OlStyle({}),
            // à changer
            drawStyle: this.drawStyleService.createDrawingInteractionStyle()
        });
    }

    createDrawLineControl(fill?: string, stroke?: string) {
        this.drawLineControl = new DrawControl({
            // à changer
            geometryType: DrawType.LineString,
            source: this.olDrawSource,
            layerStyle: new OlStyle({}),
            // à changer
            drawStyle: this.drawStyleService.createDrawingInteractionStyle()
        });
    }

    createDrawPolygonControl(fill?: string, stroke?: string) {
        this.drawPolygonControl = new DrawControl({
            // à changer
            geometryType: DrawType.Polygon,
            source: this.olDrawSource,
            layerStyle: new OlStyle({}),
            // à changer
            drawStyle: this.drawStyleService.createDrawingInteractionStyle()
        });
    }

    createDrawCircleControl(fill?: string, stroke?: string) {
        this.drawCircleControl = new DrawControl({
            // à changer
            geometryType: DrawType.Circle,
            source: this.olDrawSource,
            layerStyle: new OlStyle({}),
            // à changer
            drawStyle: this.drawStyleService.createDrawingInteractionStyle()
        });
    }

    onDrawTypeChange(drawType: DrawType) {
        this.activeDrawType = drawType;
    }

    private initStore() {
        const store = this.store;

        const layer = new VectorLayer({
          title: 'Draws',
          zIndex: 200,
          source: new FeatureDataSource(),
          style: createDrawLayerStyle(),
          showInLayerList: false,
          exportable: false,
          browsable: false
        });
        tryBindStoreLayer(store, layer);

        tryAddLoadingStrategy(store);

        tryAddSelectionStrategy(store, new FeatureStoreSelectionStrategy({
          map: this.map,
          many: true
        }));

        this.selectedFeatures$$ = store.stateView.manyBy$((record: EntityRecord<FeatureWithDraw>) => {
            return record.state.selected === true;
        }).pipe(
            skip(1)  // Skip initial emission
        )
        .subscribe((records: EntityRecord<FeatureWithDraw>[]) => {
            this.selectedFeatures$.next(records.map(record => record.entity));
        });
    }

    changeStoreLayerStyle() {
        this.drawStyleService.setFill(this.fillColor);
        this.drawStyleService.setStroke(this.strokeColor);
        this.store.layer.ol.setStyle(this.drawStyleService.createDrawLayerStyle());
        this.store.layer.ol.getStyle().getText().setText(this.store.source.ol.getFeatures())
        this.createDrawPointControl();
        this.createDrawLineControl();
        this.createDrawPolygonControl();
        this.createDrawCircleControl();
    }

    /**
     * Activate or deactivate the current draw control
     * @internal
     */
    onToggleDrawControl(toggle: boolean) {
        if (toggle === true) {
            this.toggleDrawControl();
        } else {
            this.deactivateDrawControl();
        }
    }

    /**
     * Activate the right control
     */
    private toggleDrawControl() {
        this.deactivateDrawControl();
        // this.deactivateModifyControl();
        if (this.activeDrawType === DrawType.Point) {
        this.activateDrawControl(this.drawPointControl);
        } else if (this.activeDrawType === DrawType.LineString) {
        this.activateDrawControl(this.drawLineControl);
        } else if (this.activeDrawType === DrawType.Polygon) {
            this.activateDrawControl(this.drawPolygonControl);
        } else if (this.activeDrawType === DrawType.Circle) {
            this.activateDrawControl(this.drawCircleControl);
        }
    }
    
    private openDialog(olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle): void {
        const dialogRef = this.dialog.open(DrawerPopupComponent, {
            disableClose: false
        });

        dialogRef.afterClosed().subscribe (() => {
            dialogRef.componentInstance.onOk$.subscribe(label => {
                this.updateLabelOfOlGeometry(olGeometry, label);
                this.onDrawEnd(olGeometry)
            })
        });
    }

    /**
     * Activate a given control
     * @param drawControl Draw control
     */
    private activateDrawControl(drawControl: DrawControl) {
        this.activeDrawControl = drawControl;
        this.drawStart$$ = drawControl.start$
        .subscribe((olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle) => this.onDrawStart(olGeometry));
        this.drawEnd$$ = drawControl.end$
        .subscribe((olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle) => {
            this.openDialog(olGeometry);
        });

        drawControl.setOlMap(this.map.ol);
    }

    /**
     * Deactivate the active draw control
     */
    private deactivateDrawControl() {
        if (this.activeDrawControl === undefined) {
            return;
        }

        this.olDrawSource.clear();
        if (this.drawStart$$ !== undefined ) { this.drawStart$$.unsubscribe(); }
        if (this.drawEnd$$ !== undefined ) { this.drawEnd$$.unsubscribe(); }

        this.activeDrawControl.setOlMap(undefined);
        this.activeDrawControl = undefined;
        this.activeOlGeometry = undefined;
    }

    /**
     * Clear the draw source and track the geometry being drawn
     * @param olGeometry Ol linestring or polygon
     */
    private onDrawStart(olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle) {
        this.activeOlGeometry = olGeometry;
    }

    /**
     * Clear the draw source and track the geometry being draw
     * @param olGeometry Ol linestring or polygon
     */
    private onDrawEnd(olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle) {
        this.activeOlGeometry = undefined;
        this.addFeatureToStore(olGeometry);
        this.olDrawSource.clear(true);
    }

    private setActiveDrawType(drawType: DrawType) {
        this._activeDrawType = drawType;
        this.toggleDrawControl();
    }

    /**
     * Add a feature with measures to the store. The loading stragegy of the store
     * will trigger and add the feature to the map.
     * @internal
     */
    private addFeatureToStore(olGeometry: OlPoint | OlLineString | OlPolygon | OlCircle, feature?: FeatureWithDraw) {
        const featureId = feature ? feature.properties.id : uuid();
        const drawCount = this.drawStyleService.getDrawCount();
        const projection = this.map.ol.getView().getProjection();

        const geometry = new OlGeoJSON().writeGeometryObject(olGeometry, {
            featureProjection: projection,
            dataProjection: projection
        });

        if (olGeometry.getType() === 'Circle') {
            geometry.coordinates = olGeometry.getCenter();
            geometry.radius = olGeometry.getRadius();
        }

        this.store.update({
            type: FEATURE,
            geometry,
            properties: {
                id: featureId,
                draw: olGeometry.get('_label')
            },
            projection: projection.getCode(),
            meta: {
                id: featureId
            }
        });
        console.log(this.store.source);
        this.drawStyleService.raiseDrawCounter();
        console.log(this.store.state);
        console.log(this.store.stateView);
        console.log(this.store.source.ol.getFeatures());
    }

    private buildForm() {
        this.form = this.formBuilder.group({
            fill: [''],
            stroke: ['']
        });
    }

    deleteDrawings() {
        this.store.deleteMany(this.selectedFeatures$.value);
    }

    private getDrawingStyle(): any {
        return this.drawingStyle;
    }

    private createDrawingStyle() {
        this.drawingStyle = this.styleService.createStyle({
            fill: this.form.value.fill,
            stroke: this.form.value.stroke
        });
    }

    /*
    private toggleDrawControl() {
        this.deactivateDrawControl();
        // this.deactivateModifyControl();
        if (this.activeMeasureType === MeasureType.Length) {
          this.activateDrawControl(this.drawLineControl);
        } else if (this.activeMeasureType === MeasureType.Area) {
          this.activateDrawControl(this.drawPolygonControl);
        }
    }
    */

    /**
     * Clear the tooltips of an OL geometrys
     * @param olGeometry OL geometry with tooltips
     */
    private clearTooltipsOfOlGeometry(olGeometry: OlLineString | OlPolygon) {
        getTooltipsOfOlGeometry(olGeometry).forEach((olTooltip: OlOverlay | undefined) => {
            if (olTooltip !== undefined && olTooltip.getMap() !== undefined) {
                this.map.ol.removeOverlay(olTooltip);
            }
        });
    }
    /**
     * Clear the map tooltips
     * @param olDrawSource OL vector source
     */
    private clearTooltipsOfOlSource(olSource: OlVectorSource) {
        olSource.forEachFeature((olFeature: OlFeature) => {
        const olGeometry = olFeature.getGeometry();
            if (olGeometry !== undefined) {
                this.clearTooltipsOfOlGeometry(olFeature.getGeometry());
            }
        });
    }

    onToggleTooltips(toggle: boolean) {
        this.showTooltips = toggle;
        if (toggle === true) {
        this.showTooltipsOfOlSource(this.store.source.ol);
        } else {
        this.clearTooltipsOfOlSource(this.store.source.ol);
        }
    }

    private showTooltipsOfOlSource(olSource: OlVectorSource) {
        olSource.forEachFeature((olFeature: OlFeature) => {
            this.showTooltipsOfOlGeometry(olFeature.getGeometry());
        });
    }
   
    private showTooltipsOfOlGeometry(olGeometry:  OlPoint | OlLineString | OlPolygon | OlCircle) {
        getTooltipsOfOlGeometry(olGeometry).forEach((olTooltip: OlOverlay | undefined) => {
            if (this.shouldShowTooltip(olTooltip)) {
                this.map.ol.addOverlay(olTooltip);
            }
        });
    }

    private updateLabelOfOlGeometry(olGeometry:  OlPoint | OlLineString | OlPolygon | OlCircle, label: string) {
        olGeometry.setProperties({_label: label}, true);
    }
    
    /**
     * Whether a tooltip should be showned based on the length
     * of the segment it is bound to.
     * @param olTooltip OL overlay
     * @returns True if the tooltip should be shown
     */
    private shouldShowTooltip(olTooltip: OlOverlay): boolean {
        if (this.showTooltips === false) {
            return false;
        }

        const properties = olTooltip.getProperties() as any;
        const label = properties._label;
        if (label === undefined) {
            return false;
        }

        return true;
    }
}
