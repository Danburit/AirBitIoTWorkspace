import { MetricFindValue1 } from './types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { find } from 'lodash';

export const Metric = ({ setAlert, datasource, device, subDevice, metrics, setMetrics, query }) => {
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
    (device_id: number) => {
      let data: { device_id: number } = { device_id: device_id };
      return datasource.deviceMetricFindValue(data).then(
        (result: MetricFindValue1[]) => {
          let metrics = result.map((value: MetricFindValue1) => ({ label: value.text, value: value.value }));
          setMetrics(getArrCurMetr(metrics, query?.metrics));
          return metrics;
        },
        (response: any) => {
          setAlert({
            title: `Device metrics loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDeviceMetricOptions = React.useCallback(
    (device_id: number) => {
      setMetricOptionsIsLoading(true);
      loadDeviceMetricOptions(device_id)
        .then((result) => {
          setDeviceMetricOptions(result);
        })
        .finally(() => {
          setMetricOptionsIsLoading(false);
        });
    },
    [loadDeviceMetricOptions, setMetrics, setDeviceMetricOptions]
  );
  React.useEffect(() => {
    if (device?.id === undefined || device.id === query?.device) {
      return;
    }
    refreshDeviceMetricOptions(device.id);
  }, [refreshDeviceMetricOptions, device]);

  const loadSubDeviceMetricOptions = React.useCallback(
    (device_id: number, subdevice_id: number) => {
      let data: { device_id: number; sub_device_id: number } = {
        device_id: device_id,
        sub_device_id: subdevice_id,
      };
      return datasource.subDeviceMetricFindValue(data).then(
        (result: MetricFindValue1[]) => {
          let metrics = result.map((value: MetricFindValue1) => ({ label: value.text, value: value.value }));
          setMetrics(getArrCurMetr(metrics, query?.metrics));
          return metrics;
        },
        (response: any) => {
          setAlert({
            title: `SubDevice metrics loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshSubDeviceMetricOptions = React.useCallback(
    (device_id: number, subdevice_id: number) => {
      setMetricOptionsIsLoading(true);
      loadSubDeviceMetricOptions(device_id, subdevice_id)
        .then((result) => {
          setSubDeviceMetricOptions(result);
        })
        .finally(() => {
          setMetricOptionsIsLoading(false);
        });
    },
    [loadSubDeviceMetricOptions, setMetrics, setSubDeviceMetricOptions, setMetricOptionsIsLoading]
  );
  React.useEffect(() => {
    if (device?.id === undefined || subDevice?.value === undefined || query?.subdevice === subDevice) {
      return;
    }
    refreshSubDeviceMetricOptions(device.id, subDevice.value);
  }, [refreshSubDeviceMetricOptions, subDevice]);
  if (device === null) {
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
            setMetrics([]);
            setMetricIsClearable(false);
          } else {
            setMetrics(v);
            setMetricIsClearable(true);
          }
        }}
        isMulti={true}
        isLoading={metricOptionsIsLoading}
        isClearable={metricIsClearable}
      />
    </div>
  );
};
