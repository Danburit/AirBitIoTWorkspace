import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { Alert } from '@grafana/ui';
import { Metric } from './Metric';
import React, { ComponentType } from 'react';
import { DataSource } from '../DataSource';
import { AlertValue, DeviceValue, GenericOptions, GrafanaQuery, LastQuery } from '../types';
import { SubDevice } from './SubDevice';
import { EmptySelectableValue, queryModeOptions } from '../constance';
import { QueryMode } from './QueryMode';
import { QueryDeviceName } from './QueryDeviceName';
import { QueryDeviceTriplet } from './QueryDeviceTriplet';
import { QueryDeviceID } from './QueryDeviceID';
import { Group } from './Group';
import { FeaturesSlug } from './FeaturesSlug';
import { Format } from '../format';
import { Address } from './Address';
import { Converter } from './Converter';

type Props = QueryEditorProps<DataSource, GrafanaQuery, GenericOptions>;

export const QueryEditor: ComponentType<Props> = ({ datasource, onChange, onRunQuery, query }) => {
  const [device, setDevice] = React.useState<DeviceValue | null>(
    query?.lastQuery !== undefined ? { ...query?.lastQuery.device } : null
  );
  const [subDevice, setSubDevice] = React.useState<SelectableValue<number>>(
    query?.lastQuery?.subDevice || EmptySelectableValue
  );
  const [converter, setConverter] = React.useState<SelectableValue<number>>(
    query?.lastQuery?.converter ?? EmptySelectableValue
  );
  const [metrics, setMetrics] = React.useState<SelectableValue<string>>(query?.lastQuery?.metrics ?? []);
  const [alert, setAlert] = React.useState<AlertValue | null>(null);
  const [lastQuery, setLastQuery] = React.useState<LastQuery | null>(query?.lastQuery ?? null);
  const [queryMode, setQueryMode] = React.useState<SelectableValue<Format>>(
    query?.lastQuery?.queryMode ?? queryModeOptions[0]
  );
  const [group, setGroup] = React.useState<SelectableValue<number>>(query?.lastQuery?.group ?? EmptySelectableValue);
  const [featuresSlug, setFeaturesSlug] = React.useState<SelectableValue<number>>(
    query?.lastQuery?.featuresSlug ?? EmptySelectableValue
  );
  const [address, setAddress] = React.useState<SelectableValue<number>>(
    query?.lastQuery?.address ?? EmptySelectableValue
  );

  const [conv_SubDev, setConv_SubDev] = React.useState<number>(-1);

  React.useEffect(() => {
    setConv_SubDev((prev) => -1);
    setMetrics((prev) => []);
    setConverter((prev) => EmptySelectableValue);
    setSubDevice((prev) => EmptySelectableValue);
  }, [device]);
  React.useEffect(() => {
    if (metrics.length !== 0) {
      setMetrics((prev) => []);
    }
  }, [converter, subDevice]);
  React.useEffect(() => {
    if (subDevice !== EmptySelectableValue) {
      setSubDevice((prev) => EmptySelectableValue);
    }
  }, [converter]);
  React.useEffect(() => {
    if (converter !== EmptySelectableValue) {
      setConverter((prev) => EmptySelectableValue);
    }
  }, [subDevice]);
  React.useEffect(() => {
    if (device?.id === undefined || !metrics.length) {
      return;
    }

    if (
      lastQuery !== null &&
      lastQuery.metrics === metrics &&
      lastQuery.device.id === device.id &&
      lastQuery?.subDevice?.value === subDevice?.value
    ) {
      return;
    }

    let metricArray = metrics.map((value: SelectableValue) => value.value);
    let obj: GrafanaQuery = { ...query, metrics: metricArray, device: device.id };

    let tLastQuery: LastQuery = {
      metrics: metrics,
      device: device,
      queryMode: queryMode,
    };
    if (subDevice?.value !== undefined) {
      obj.subdevice = subDevice?.value;
      tLastQuery.subDevice = subDevice;
    } else {
      if (obj?.subdevice) {
        delete obj.subdevice;
      }
    }
    if (group !== EmptySelectableValue) {
      tLastQuery.group = group;
    }
    if (featuresSlug !== EmptySelectableValue) {
      tLastQuery.featuresSlug = featuresSlug;
    }
    if (address !== EmptySelectableValue) {
      tLastQuery.address = address;
    }
    if (converter !== EmptySelectableValue) {
      tLastQuery.converter = converter;
    }
    setLastQuery((prev) => tLastQuery);
    obj.lastQuery = tLastQuery;
    onChange(obj);

    onRunQuery();
  }, [datasource, metrics]);

  const alertF = () => {
    if (alert === null) {
      return null;
    }
    return (
      <div>
        <Alert
          title={alert?.title ?? ''}
          onRemove={(e) => {
            setAlert((prev) => null);
          }}
          // @ts-ignore
          severity={alert?.severity ?? 'error'}
        />
      </div>
    );
  };

  return (
    <>
      {alertF()}
      <Group query={query} setAlert={setAlert} datasource={datasource} group={group} setGroup={setGroup} />
      <FeaturesSlug
        setAlert={setAlert}
        query={query}
        datasource={datasource}
        featuresSlug={featuresSlug}
        setFeaturesSlug={setFeaturesSlug}
      />
      <Address setAlert={setAlert} address={address} setAddress={setAddress} datasource={datasource} query={query} />
      <QueryMode queryMode={queryMode} setQueryMode={setQueryMode} />
      <QueryDeviceName
        setAlert={setAlert}
        queryMode={queryMode}
        group={group}
        featuresSlug={featuresSlug}
        address={address}
        device={device}
        datasource={datasource}
        setDevice={setDevice}
      />
      <QueryDeviceTriplet
        address={address}
        setAlert={setAlert}
        group={group}
        featuresSlug={featuresSlug}
        device={device}
        queryMode={queryMode}
        datasource={datasource}
        setDevice={setDevice}
      />
      <QueryDeviceID
        query={query}
        setAlert={setAlert}
        group={group}
        featuresSlug={featuresSlug}
        address={address}
        queryMode={queryMode}
        datasource={datasource}
        device={device}
        setDevice={setDevice}
      />
      <div className="gf-form gf-form-inline--nowrap">
        <Converter
          conv_SubDev={conv_SubDev}
          setConv_SubDev={setConv_SubDev}
          query={query}
          setAlert={setAlert}
          datasource={datasource}
          device={device}
          converter={converter}
          setConverter={setConverter}
        />
        <SubDevice
          conv_SubDev={conv_SubDev}
          setConv_SubDev={setConv_SubDev}
          query={query}
          setAlert={setAlert}
          device={device}
          subDevice={subDevice}
          setSubDevice={setSubDevice}
          datasource={datasource}
        />
      </div>
      <Metric
        conv_SubDev={conv_SubDev}
        query={query}
        setAlert={setAlert}
        datasource={datasource}
        metrics={metrics}
        converter={converter}
        setMetrics={setMetrics}
        device={device}
        subDevice={subDevice}
      />
    </>
  );
};
