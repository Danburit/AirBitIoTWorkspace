import { MetricFindValue1 } from '../types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { find } from 'lodash';

export const Metric = ({
  setAlert,
  converter,
  datasource,
  conv_SubDev,
  device,
  subDevice,
  metrics,
  setMetrics,
  query,
}) => {
  const [metricOptionsIsLoading, setMetricOptionsIsLoading] = React.useState<boolean>(false);
  const [metricIsClearable, setMetricIsClearable] = React.useState<boolean>(false);
  const [deviceMetricOptions, setDeviceMetricOptions] = React.useState<Array<SelectableValue<string>>>([]);
  const [subDeviceMetricOptions, setSubDeviceMetricOptions] = React.useState<Array<SelectableValue<string>>>([]);

  const getArrCurMetr = (metrics, qMetrics) => {
    let arr: SelectableValue<string> = [];
    if (!metrics || !qMetrics) {
      return arr;
    }
    for (let v in qMetrics) {
      let f = find(metrics, (opt) => opt.value === qMetrics[v]);
      if (f) {
        arr.push(f);
      }
    }
    return arr;
  };

  const loadDeviceMetricOptions = React.useCallback(
    (device_id: number, converter_id?: number) => {
      let data: { device_id: number; converter?: number } = { device_id: device_id };
      if (converter_id) {
        data.converter = converter_id;
      }
      return datasource.deviceMetricFindValue(data).then(
        (result: MetricFindValue1[]) => {
          let metrics = result.map((value: MetricFindValue1) => ({ label: value.text, value: value.value }));
          setMetrics((prev) => getArrCurMetr(metrics, query?.metrics));
          return metrics;
        },
        (response: any) => {
          let title = `Device metrics loading error:\n${response.status} - ${response.statusText}`;
          title += `\ndevice_id: ${device_id}`;
          title += `\nconverter_id: ${converter_id}`;
          let severity = 'error';
          setAlert((prev) => ({ title: title, severity: severity }));
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDeviceMetricOptions = React.useCallback(
    (device_id: number, converter_id?: number) => {
      setMetricOptionsIsLoading((prev) => true);
      loadDeviceMetricOptions(device_id, converter_id)
        .then((result) => {
          setDeviceMetricOptions((prev) => result);
        })
        .finally(() => {
          setMetricOptionsIsLoading((prev) => false);
        });
    },
    [loadDeviceMetricOptions, setDeviceMetricOptions]
  );
  React.useEffect(() => {
    if (device?.id !== undefined && converter?.value !== undefined) {
      refreshDeviceMetricOptions(device.id, converter.value);
    }
  }, [refreshDeviceMetricOptions, converter]);

  // React.useEffect(() => {}, [refreshDeviceMetricOptions]);
  const loadSubDeviceMetricOptions = React.useCallback(
    (device_id: number, subdevice_id: number) => {
      let data: { device_id: number; sub_device_id: number } = {
        device_id: device_id,
        sub_device_id: subdevice_id,
      };
      return datasource.subDeviceMetricFindValue(data).then(
        (result: MetricFindValue1[]) => {
          let metrics = result.map((value: MetricFindValue1) => ({ label: value.text, value: value.value }));
          setMetrics((prev) => getArrCurMetr(metrics, query?.metrics));
          return metrics;
        },
        (response: any) => {
          let title = `SubDevice metrics loading error:\n${response.status} - ${response.statusText}`;
          title += `\ndevice_id: ${device_id}`;
          title += `\nsubdevice_id:${subdevice_id}`;
          let severity = 'error';
          setAlert((prev) => ({ title: title, severity: severity }));
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshSubDeviceMetricOptions = React.useCallback(
    (device_id: number, subdevice_id: number) => {
      setMetricOptionsIsLoading((prev) => true);
      loadSubDeviceMetricOptions(device_id, subdevice_id)
        .then((result) => {
          setSubDeviceMetricOptions((prev) => result);
        })
        .finally(() => {
          setMetricOptionsIsLoading((prev) => false);
        });
    },
    [loadSubDeviceMetricOptions, setSubDeviceMetricOptions, setMetricOptionsIsLoading]
  );
  React.useEffect(() => {
    if (device?.id === undefined || subDevice?.value === undefined) {
      return;
    }
    refreshSubDeviceMetricOptions(device.id, subDevice.value);
  }, [refreshSubDeviceMetricOptions, subDevice]);
  if (device === null || conv_SubDev === -1) {
    return null;
  }
  return (
    <div className="gf-form">
      <Select
        prefix={subDevice?.value !== undefined ? 'SubDevice metrics: ' : 'Device metrics: '}
        value={metrics}
        placeholder={''}
        options={subDevice?.value !== undefined ? subDeviceMetricOptions : deviceMetricOptions}
        onChange={(v) => {
          if (v === null) {
            setMetrics((prev) => []);
            setMetricIsClearable((prev) => false);
          } else {
            setMetrics((prev) => v);
            setMetricIsClearable((prev) => true);
          }
        }}
        isMulti={true}
        isLoading={metricOptionsIsLoading}
        isClearable={metricIsClearable}
      />
    </div>
  );
};
