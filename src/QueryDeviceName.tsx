import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { Format } from './format';
import { EmptySelectableValue } from './constance';

export const QueryDeviceName = ({ setAlert, queryMode, group, featuresSlug, datasource, device, setDevice }) => {
  const [deviceOptions, setDeviceOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [deviceOptionsIsLoading, setDeviceOptionsIsLoading] = React.useState<boolean>(false);
  const [deviceIsClearable, setDeviceIsClearable] = React.useState<boolean>(false);
  const [deviceQr, setDeviceQr] = React.useState<string>('');
  const [selDevice, setSelDevice] = React.useState<SelectableValue<number>>(
    device?.id ? { label: device.name, value: device.id } : EmptySelectableValue
  );

  const loadDeviceOptions = React.useCallback(
    (device_name: string, group?: number, features_slug?: number) => {
      let data: { device_name: string; group?: number; features_slug?: number } = {
        device_name: device_name,
      };
      if (group !== undefined) {
        data.group = group;
      }
      if (features_slug !== undefined) {
        data.features_slug = features_slug;
      }
      return datasource.deviceByNameFindQuery(data).then(
        (result) => {
          setDeviceIsClearable(false);
          setSelDevice(EmptySelectableValue);
          return result.map((value) => ({ label: value.text, value: value.value }));
        },
        (response) => {
          setAlert({
            title: `DeviceByNameOptions loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDeviceOptions = React.useCallback(
    (device_name: string, group?: number, features_slug?: number) => {
      setDeviceOptionsIsLoading(true);
      loadDeviceOptions(device_name, group, features_slug)
        .then((deviceOptions) => {
          setDeviceOptions(deviceOptions);
        })
        .finally(() => {
          setDeviceOptionsIsLoading(false);
        });
    },
    [loadDeviceOptions, setDeviceOptions, setDeviceOptionsIsLoading] // доп рендерит изза сеттеров
  );
  React.useEffect(() => {
    if (deviceQr !== '' && queryMode.value === Format.DeviceName) {
      return refreshDeviceOptions(deviceQr, group?.value, featuresSlug?.value);
    }
  }, [deviceQr, refreshDeviceOptions, group, featuresSlug]);

  const loadDevice = React.useCallback(
    (device_id) => {
      let data: { device_id: number } = {
        device_id: device_id,
      };
      return datasource.deviceByIDFindQuery(data).then(
        (result: any) => {
          return result;
        },
        (response: any) => {
          setAlert({
            title: `DeviceByID loading error:\n${response.status} - ${response.statusText}\ndevice_id: ${device_id}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDevice = React.useCallback(
    (device_id) => {
      loadDevice(device_id).then((device) => {
        setDeviceIsClearable(true);
        setDevice(device);
      });
    },
    [loadDevice, setDevice]
  );
  React.useEffect(() => {
    if (selDevice === EmptySelectableValue || selDevice.value === device?.id || queryMode.value !== Format.DeviceName) {
      return;
    }
    refreshDevice(selDevice?.value);
  }, [refreshDevice, selDevice]);

  const refreshSelDevice = React.useCallback(
    (device) => {
      setDeviceIsClearable(true);
      setSelDevice({ label: device?.name || device.id, value: device.id });
    },
    [setSelDevice]
  );

  React.useEffect(() => {
    if (device === null || device?.id === selDevice?.value) {
      return;
    }
    refreshSelDevice(device);
  }, [device, refreshSelDevice]);
  if (queryMode.value !== Format.DeviceName) {
    return null;
  }
  return (
    <div className="gf-form">
      <Select
        prefix="Device name: "
        isLoading={deviceOptionsIsLoading}
        isClearable={deviceIsClearable}
        options={deviceOptions}
        value={selDevice}
        onChange={(v) => {
          if (v === null) {
            setDeviceIsClearable(false);
            setSelDevice(EmptySelectableValue);
          } else {
            setDeviceIsClearable(true);
            setSelDevice(v);
          }
        }}
        onInputChange={(v) => {
          setDeviceQr(v ?? '');
        }}
      />
    </div>
  );
};
