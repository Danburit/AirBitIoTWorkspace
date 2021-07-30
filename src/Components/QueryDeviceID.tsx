import { Format } from '../format';
import React from 'react';
import { Input } from '@grafana/ui';

export const QueryDeviceID = ({
  group,
  featuresSlug,
  query,
  setAlert,
  queryMode,
  datasource,
  device,
  setDevice,
  address,
}) => {
  const [deviceID, setDeviceID] = React.useState<number | null>(query?.device ?? device?.id ?? null);
  const [deviceIDInput, setDeviceIDInput] = React.useState<number | null>(query?.device ?? device?.id ?? null);

  const loadDevice = React.useCallback(
    (device_id: number, group?: number, features_slug?: number, address?: number) => {
      let data: { device_id: number; group?: number; featuresSlug?: number; address?: number } = {
        device_id: device_id,
      };
      if (group !== undefined) {
        data.group = group;
      }
      if (features_slug !== undefined) {
        data.featuresSlug = features_slug;
      }
      if (address !== undefined) {
        data.address = address;
      }
      return datasource.deviceByIDFindQuery(data).then(
        (result: any) => {
          return result;
        },
        (response: any) => {
          let title = `DeviceByID loading error:\n${response.status} - ${response.statusText}`;
          title += `\ndevice_id: ${device_id}`;
          if (group !== undefined) {
            title += `\ngroup: ${group}`;
          }
          if (features_slug !== undefined) {
            title += `\nfeatures_slug: ${features_slug}`;
          }
          if (address !== undefined) {
            title += `\naddress: ${address}`;
          }
          let severity = 'error';
          setAlert((prev) => ({ title: title, severity: severity }));
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshDevice = React.useCallback(
    (device_id: number, group?: number, features_slug?: number, address?: number) => {
      loadDevice(device_id, group, features_slug, address).then((result) => {
        if (result?.id === undefined) {
          let title = `Device:\nUnknown device with:`;
          title += `\nid: ${device_id}`;
          if (group !== undefined) {
            title += `\ngroup: ${group}`;
          }
          if (features_slug !== undefined) {
            title += `\nfeatures_slug: ${features_slug}`;
          }
          if (address !== undefined) {
            title += `\naddress: ${address}`;
          }
          let severity = 'warning';
          setAlert((prev) => ({ title: title, severity: severity }));
          return;
        }
        setDevice((prev) => result);
      });
    },
    [loadDevice]
  );
  React.useEffect(() => {
    if (deviceID === null || queryMode.value !== Format.DeviceID) {
      return;
    }
    refreshDevice(deviceID, group?.value, featuresSlug?.value, address?.value);
  }, [refreshDevice, deviceID, group, featuresSlug, address]);

  React.useEffect(() => {
    if (device?.id === undefined || device?.id === deviceID) {
      return;
    }
    setDeviceID((prev) => device.id);
    setDeviceIDInput((prev) => device.id);
  }, [device]);

  if (queryMode.value !== Format.DeviceID) {
    return null;
  }
  return (
    <div className="gf-form">
      <Input
        value={deviceIDInput ?? ''}
        onBlur={() => {
          if (deviceIDInput !== null) {
            setDeviceID((prev) => deviceIDInput);
          }
        }}
        onChange={(v) => {
          // @ts-ignore
          let value = v.target.value;
          value = value.replace(/\D/g, '');
          if (value === '') {
            setDeviceIDInput((prev) => null);
          } else {
            setDeviceIDInput((prev) => parseInt(value, 10));
          }
        }}
        prefix={'Device ID:'}
      />
    </div>
  );
};
