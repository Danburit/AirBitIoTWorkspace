import { DataQueryResponse, DataSourceApi, DataSourceInstanceSettings, toDataFrame } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { isObject } from 'lodash';
import {
  CompanyFindValue,
  DeviceValue,
  FeatureSetFindValue,
  GenericOptions,
  GrafanaQuery,
  GroupFindValue,
  MetricFindValue1,
  QueryRequest,
  ConverterFindValue,
  SubDeviceFindValue,
  TypeNetIDValue,
  UserCheckValue,
  DeviceFindValue,
  AddressFindValue,
} from './types';

export class DataSource extends DataSourceApi<GrafanaQuery, GenericOptions> {
  url: string;
  withCredentials: boolean;
  headers: any;

  constructor(instanceSettings: DataSourceInstanceSettings<GenericOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url === undefined ? '' : instanceSettings.url;

    this.withCredentials = instanceSettings.withCredentials !== undefined;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: QueryRequest): Promise<DataQueryResponse> {
    const request = this.processTargets(options);
    if (request.targets.length === 0) {
      return Promise.resolve({ data: [] });
    }
    request.targets = request.targets.map((obj) => {
      delete obj['lastQuery'];
      return obj;
    });

    return this.doRequest({
      url: `${this.url}/query/`,
      data: request,
      method: 'POST',
    }).then((entry) => {
      entry.data = entry.data.map(toDataFrame);
      return entry;
    });
  }

  testDatasource(): Promise<any> {
    return this.doRequest({
      url: this.url,
      method: 'GET',
    }).then((response) => {
      if (response.status === 200) {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      }

      return {
        status: 'error',
        message: `Data source is not working: ${response.message}`,
        title: 'Error',
      };
    });
  }

  deviceMetricFindValue(data: any): Promise<MetricFindValue1[]> {
    return this.doRequest({
      url: `${this.url}/metrics/dev/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  subDeviceMetricFindValue(data: any): Promise<MetricFindValue1[]> {
    return this.doRequest({
      url: `${this.url}/metrics/subdev/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  deviceByNameFindQuery(data: any): Promise<DeviceFindValue[]> {
    return this.doRequest({
      url: `${this.url}/dev/by_name/`,
      data: data,
      method: 'POST',
    }).then(this.getData);
  }

  deviceByNetIDFindQuery(data: any): Promise<DeviceValue> {
    return this.doRequest({
      url: `${this.url}/dev/by_net_id/`,
      data: data,
      method: 'POST',
    }).then(this.getData);
  }

  deviceByIDFindQuery(data: any): Promise<DeviceValue> {
    return this.doRequest({
      url: `${this.url}/dev/by_id/`,
      data: data,
      method: 'POST',
    }).then(this.getData);
  }

  typeNetIDFindQuery(): Promise<TypeNetIDValue[]> {
    return this.doRequest({
      url: `${this.url}/lists/types_net_id/`,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  subDeviceFindQuery(data: any): Promise<SubDeviceFindValue[]> {
    return this.doRequest({
      url: `${this.url}/subdev/by_dev_id/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  converterFindQuery(data: any): Promise<ConverterFindValue[]> {
    return this.doRequest({
      url: `${this.url}/lists/converters/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  groupFindQuery(): Promise<GroupFindValue[]> {
    return this.doRequest({
      url: `${this.url}/lists/groups/`,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  featureSetFindQuery(): Promise<FeatureSetFindValue[]> {
    return this.doRequest({
      url: `${this.url}/lists/features/`,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  userCheckQuery(): Promise<UserCheckValue> {
    return this.doRequest({
      url: `${this.url}/checks/role/`,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  companyByIDFindQuery(data: any): Promise<CompanyFindValue[]> {
    return this.doRequest({
      url: `${this.url}/companies/by_id/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  companyByNameFindQuery(data: any): Promise<CompanyFindValue[]> {
    return this.doRequest({
      url: `${this.url}/companies/by_name/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  addressByNameFindQuery(data: any): Promise<AddressFindValue[]> {
    return this.doRequest({
      url: `${this.url}/lists/addresses/`,
      data: data,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  mapToTextValue(result: any) {
    if (isObject(result.data)) {
      return result.data;
    }
    return result.data.map((d: any, i: any) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      }

      if (isObject(d)) {
        return { text: d, value: i };
      }
      return { text: d, value: d };
    });
  }

  getData(result: any) {
    return result.data;
  }

  doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return getBackendSrv().datasourceRequest(options);
  }

  processTargets(options: QueryRequest) {
    options.targets = options.targets.filter((target) => {
      return target?.device !== undefined && target?.metrics !== undefined;
    });
    return options;
  }
}
