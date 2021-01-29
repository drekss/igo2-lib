import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NetworkService, ConnectionState } from '@igo2/core';
import { getEntityTitle, getEntityIcon } from '@igo2/common';
import type { Toolbox } from '@igo2/common';

import { Feature } from '../shared';
import { SearchSource } from '../../search/shared/sources/source';
import { IgoMap } from '../../map/shared/map';

@Component({
  selector: 'igo-feature-details',
  templateUrl: './feature-details.component.html',
  styleUrls: ['./feature-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FeatureDetailsComponent implements OnInit, OnDestroy {
  private state: ConnectionState;
  private unsubscribe$ = new Subject<void>();
  ready = false;

  @Input()
  get source(): SearchSource {
    return this._source;
  }
  set source(value: SearchSource ) {
    this._source = value;
    this.cdRef.detectChanges();
  }

  @Input() map: IgoMap;

  @Input() toolbox: Toolbox;

  @Input()
  get feature(): Feature {
    return this._feature;
  }
  set feature(value: Feature) {
    this._feature = value;
    this.cdRef.detectChanges();
    this.selectFeature.emit();
  }

  private _feature: Feature;
  private _source: SearchSource;

  @Output() routeEvent = new EventEmitter<boolean>();
  @Output() selectFeature = new EventEmitter<boolean>();

  /**
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.feature);
  }

  /**
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.feature) || 'link';
  }


  constructor(
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private networkService: NetworkService
  ) {
    this.networkService.currentState().pipe(takeUntil(this.unsubscribe$)).subscribe((state: ConnectionState) => {
      this.state = state;
    });
  }

  ngOnInit() {
    this.ready = true;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  resourceUrlByPassSanitizer(value): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  htmlByPassSanitizer(value): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  validateHtml(value): SafeHtml {
    const valToCheck = value.split(`onclick="`)[1]
    if (valToCheck && /^\bcallAngularFunction\(\'\w+\.pdf\'\)\; return false\;/g.test(valToCheck)) {
      value = this.htmlByPassSanitizer(value);
    }
    return value
  }

  isObject(value) {
    return typeof value === 'object';
  }

  isUrl(value) {
    if (typeof value === 'string') {
      return (
        value.slice(0, 8) === 'https://' || value.slice(0, 7) === 'http://'
      );
    } else {
      return false;
    }
  }

  isImg(value) {
    if (this.isUrl(value)) {
      return (
        ['jpg', 'png', 'gif'].includes(value.split('.').pop().toLowerCase())
      );
    } else {
      return false;
    }
  }

  filterFeatureProperties(feature) {
    const allowedFieldsAndAlias = feature.meta ? feature.meta.alias : undefined;
    const properties = {};
    let offlineButtonState;

    if (this.map) {
      this.map.offlineButtonToggle$.pipe(takeUntil(this.unsubscribe$)).subscribe(state => {
        offlineButtonState = state;
      });
    }

    if (feature.properties && feature.properties.Route && this.toolbox && !this.toolbox.getTool('directions')) {
      delete feature.properties.Route;
    }

    if (allowedFieldsAndAlias) {
      Object.keys(allowedFieldsAndAlias).forEach(field => {
        properties[allowedFieldsAndAlias[field]] = feature.properties[field];
      });
      return properties;
    } else if (offlineButtonState !== undefined) {
      if (!offlineButtonState) {
        if (this.state.connection && feature.meta && feature.meta.excludeAttribute) {
          const excludeAttribute = feature.meta.excludeAttribute;
          excludeAttribute.forEach(attribute => {
            delete feature.properties[attribute];
          });
        } else if (!this.state.connection && feature.meta && feature.meta.excludeAttributeOffline) {
          const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            delete feature.properties[attribute];
          });
        }
      } else {
        if (feature.meta && feature.meta.excludeAttributeOffline) {
          const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
          excludeAttributeOffline.forEach(attribute => {
            delete feature.properties[attribute];
          });
        }
      }
    } else {
      if (this.state.connection && feature.meta && feature.meta.excludeAttribute) {
        const excludeAttribute = feature.meta.excludeAttribute;
        excludeAttribute.forEach(attribute => {
          delete feature.properties[attribute];
        });
      } else if (!this.state.connection && feature.meta && feature.meta.excludeAttributeOffline) {
        const excludeAttributeOffline = feature.meta.excludeAttributeOffline;
        excludeAttributeOffline.forEach(attribute => {
          delete feature.properties[attribute];
        });
      }
    }
    return feature.properties;
  }
}
