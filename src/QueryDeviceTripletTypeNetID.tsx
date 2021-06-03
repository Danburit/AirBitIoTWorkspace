import { TypeNetIDValue } from './types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { find } from 'lodash';
import { Format } from './format';
import { EmptySelectableValue } from './constance';

export const QueryDeviceTripletTypeNetID = ({ setAlert, queryMode, device, typeNetID, setTypeNetID, datasource }) => {
  const [typeNetIDOptions, setTypeNetIDOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [typeNetIDOptionsIsLoading, setTypeNetIDOptionsIsLoading] = React.useState<boolean>(false);
  const [typeNetIDIsClearable, setTypeNetIDIsClearable] = React.useState<boolean>(false);

  const loadTypeNetIDOptions = React.useCallback(() => {
    return datasource.typeNetIDFindQuery().then(
      (result: TypeNetIDValue[]) => {
        setTypeNetID(EmptySelectableValue);
        setTypeNetIDIsClearable(false);
        return result.map((value) => ({ label: value.text, value: value.value }));
      },
      (response: any) => {
        let title = `TypeNetIDOptions loading error:\n${response.status} - ${response.statusText}`;
        let severity = 'error';
        setAlert({ title: title, severity: severity });
        throw new Error(response.statusText);
      }
    );
  }, [datasource]);
  const refreshTypeNetIDOptions = React.useCallback(() => {
    setTypeNetIDOptionsIsLoading(true);
    loadTypeNetIDOptions()
      .then((result) => {
        setTypeNetIDOptions(result);
      })
      .finally(() => {
        setTypeNetIDOptionsIsLoading(false);
      });
  }, [loadTypeNetIDOptions, setTypeNetIDOptionsIsLoading, setTypeNetIDOptions]);

  React.useEffect(() => {
    refreshTypeNetIDOptions();
  }, [refreshTypeNetIDOptions]);

  const refreshTypeNetID = React.useCallback(
    (net_id_type_id: number) => {
      let i = find(typeNetIDOptions, (option) => option.value === net_id_type_id) ?? EmptySelectableValue;
      if (i !== EmptySelectableValue) {
        setTypeNetIDIsClearable(true);
      }
      setTypeNetID(i);
    },
    [setTypeNetID, typeNetIDOptions]
  );
  React.useEffect(() => {
    if (device?.net_id_type_id === undefined || device?.net_id_type_id === typeNetID?.value) {
      return;
    }
    refreshTypeNetID(device.net_id_type_id);
  }, [refreshTypeNetID, device]);

  if (queryMode.value !== Format.DeviceNetID) {
    return null;
  }
  return (
    <div className="gf-form--grow">
      <Select
        isClearable={typeNetIDIsClearable}
        isLoading={typeNetIDOptionsIsLoading}
        prefix="Type Net ID: "
        value={typeNetID}
        options={typeNetIDOptions}
        onChange={(v) => {
          if (v === null) {
            setTypeNetIDIsClearable(false);
            setTypeNetID(EmptySelectableValue);
          } else {
            setTypeNetIDIsClearable(true);
            setTypeNetID(v);
          }
        }}
      />
    </div>
  );
};
