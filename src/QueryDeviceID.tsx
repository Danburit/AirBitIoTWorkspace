import { Format } from './format';
import React from 'react';

export const QueryDeviceID = ({ group, featuresSlug, query, setAlert, queryMode, datasource, device, setDevice }) => {
  const [deviceID, setDeviceID] = React.useState<number | null>(query?.device ?? device?.id ?? null);
  const [deviceIDInput, setDeviceIDInput] = React.useState<number | null>(query?.device ?? device?.id ?? null);

  const loadDevice = React.useCallback(
    (device_id: number, group?: number, features_slug?: number) => {
      let data: { device_id: number; group?: number; featuresSlug?: number } = {
        device_id: device_id,
      };
      if (group !== undefined) {
        data['group'] = group;
      }
      if (features_slug !== undefined) {
        data['features_slug'] = features_slug;
      }
      return datasource.deviceByIDFindQuery(data).then(
        (result: any) => {
          return result;
        },
        (response: any) => {
          setAlert({
            title: `DeviceByID loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDevice = React.useCallback(
    (device_id: number, group?: number, features_slug?: number) => {
      loadDevice(device_id, group, features_slug).then((result) => {
        if (result?.id === undefined) {
          setAlert({ title: `Device:\nUnknown device with id ${device_id}`, severity: 'warning' });
          return;
        }
        setDevice(result);
      });
    },
    [loadDevice]
  );
  React.useEffect(() => {
    if (deviceID === null || queryMode.value !== Format.DeviceID) {
      return;
    }
    refreshDevice(deviceID, group?.value, featuresSlug?.value);
  }, [refreshDevice, deviceID, group, featuresSlug]);

  React.useEffect(() => {
    if (device?.id === undefined || device?.id === deviceID) {
      return;
    }
    setDeviceID(device.id);
    setDeviceIDInput(device.id);
  }, [device]);

  if (queryMode.value !== Format.DeviceID) {
    return null;
  }
  return (
    <div className="gf-form">
      <input
        className="gf-form-input"
        type="text"
        value={deviceIDInput ?? ''}
        onBlur={() => {
          if (deviceIDInput !== null) {
            setDeviceID(deviceIDInput);
          }
        }}
        onChange={(v) => {
          v.target.value = v.target.value.replace(/\D/g, '');
          // @ts-ignore
          if (v.target.value === '') {
            setDeviceIDInput(null);
          } else {
            setDeviceIDInput(parseInt(v.target.value, 10));
          }
        }}
      />
    </div>
  );
};
