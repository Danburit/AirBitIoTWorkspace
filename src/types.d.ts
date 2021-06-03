import { DataQuery, DataQueryRequest, DataSourceJsonData, MetricFindValue, VariableModel } from '@grafana/data';
import { TemplateSrv as GrafanaTemplateSrv } from '@grafana/runtime';
import { Format } from './format';

declare module '@grafana/runtime' {
  export interface TemplateSrv extends GrafanaTemplateSrv {
    getAdhocFilters(datasourceName: string): any;
  }
}

export interface DataSourceOptions extends DataSourceJsonData {}

export interface QueryRequest extends DataQueryRequest<GrafanaQuery> {
  adhocFilters?: any[];
}

export interface AlertValue {
  title: string;
  severity: string;
}

export interface GrafanaQuery extends DataQuery {
  device: number;
  subdevice?: number;
  metrics: any;
  // data: string;
  lastQuery?: LastQuery;
}

export interface DeviceValue {
  id: number;
  name: string;
  net_id: string;
  net_id_type_id: number;
  company_id: number | null;
}

export interface LastQuery {
  device: DeviceValue;
  subDevice?: SelectableValue<number>;
  metrics: SelectableValue<string>;
  queryMode: SelectableValue<Format>;
  group?: SelectableValue<number>;
  featuresSlug?: SelectableValue<number>;
  // typeNetID: SelectableValue<number>;
  // company: SelectableValue<number>;
}

export interface SubDeviceFindValue extends MetricFindValue {
  value: any;
  text: string;
}

export interface GenericOptions extends DataSourceJsonData {}

export interface FeatureSetFindValue extends MetricFindValue {
  value: string;
  text: string;
}

export interface GroupFindValue extends MetricFindValue {
  value: any;
  text: string;
}

export interface TypeNetIDValue extends MetricFindValue {
  value: any;
  text: string;
}

export interface CompanyFindValue extends MetricFindValue {
  value: any;
  text: string;
}

export interface UserCheckValue {
  is_super: boolean;
}

export interface DeviceFindValue extends MetricFindValue {
  value: any;
  text: string;
}

export interface MetricFindValue1 extends MetricFindValue {
  value: any;
  text: string;
}

export interface TextValuePair {
  value: any;
  text: string;
}

export interface MultiValueVariable extends VariableModel {
  allValue: string | null;
  id: string;
  current: TextValuePair;
  options: TextValuePair[];
}
