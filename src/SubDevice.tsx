import React from 'react';
import { Select } from '@grafana/ui';
import { SubDeviceFindValue } from './types';
import { SelectableValue } from '@grafana/data';
import { EmptySelectableValue } from './constance';
import { find } from 'lodash';

export const SubDevice = ({ setAlert, device, datasource, subDevice, setSubDevice, query }) => {
  const [subDeviceIsClearable, setSubDeviceIsClearable] = React.useState<boolean>(false);
  const [subDeviceOptionsIsLoading, setSubDeviceOptionsIsLoading] = React.useState<boolean>(false);
  const [subDeviceOptions, setSubDeviceOptions] = React.useState<Array<SelectableValue<number>>>([]);

  const loadSubDeviceOptions = React.useCallback(
    (device_id: number) => {
      let data = {
        device_id: device_id,
      };
      return datasource.subDeviceFindQuery(data).then(
        (results: SubDeviceFindValue[]) => {
          let r = results.map((value: SubDeviceFindValue) => ({ label: value.text, value: value.value }));
          let f = find(r, (v) => v.value === query?.subdevice) ?? EmptySelectableValue;
          setSubDevice(f);
          setSubDeviceIsClearable(f !== EmptySelectableValue);
          return r;
        },
        (response: any) => {
          setAlert({
            title: `SubDeviceOptions loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshSubDeviceOptions = React.useCallback(
    (device_id: number) => {
      setSubDeviceOptionsIsLoading(true);
      loadSubDeviceOptions(device_id)
        .then((result) => {
          setSubDeviceOptions(result);
        })
        .finally(() => {
          setSubDeviceOptionsIsLoading(false);
        });
    },
    [loadSubDeviceOptions]
  );

  React.useEffect(() => {
    if (device?.id === undefined) {
      return;
    }
    refreshSubDeviceOptions(device.id);
  }, [refreshSubDeviceOptions, device]);

  if (!subDeviceOptions.length) {
    return null;
  }
  return (
    <div className="gf-form">
      <Select
        isClearable={subDeviceIsClearable}
        isLoading={subDeviceOptionsIsLoading}
        value={subDevice}
        prefix="SubDevice: "
        options={subDeviceOptions}
        onChange={(e) => {
          if (e === null) {
            setSubDevice(EmptySelectableValue);
            setSubDeviceIsClearable(false);
          } else {
            setSubDevice(e);
            setSubDeviceIsClearable(true);
          }
        }}
      />
    </div>
  );
};
