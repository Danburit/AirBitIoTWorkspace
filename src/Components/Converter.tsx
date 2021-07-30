import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { ConverterID, EmptySelectableValue } from '../constance';
import { ConverterFindValue } from '../types';
import { find } from 'lodash';

export const Converter = ({
  conv_SubDev,
  setConv_SubDev,
  setAlert,
  datasource,
  query,
  device,
  converter,
  setConverter,
}) => {
  const [converterOptions, setConverterOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [converterOptionsIsLoading, setConverterOptionsIsLoading] = React.useState<boolean>(false);
  const [converterIsClearable, setConverterIsClearable] = React.useState<boolean>(converter !== EmptySelectableValue);

  const loadConverterOptions = React.useCallback(
    (device_id: number) => {
      let data = {
        device_id: device_id,
      };
      return datasource.converterFindQuery(data).then(
        (result: ConverterFindValue[]) => {
          let r = result.map((value: ConverterFindValue) => ({ label: value.text, value: value.value }));
          let f = find(r, (v) => v.value === query?.lastQuery?.converter) ?? EmptySelectableValue;
          setConverter((prev) => f);
          setConverterIsClearable((prev) => f !== EmptySelectableValue);
          return r;
        },
        (response: any) => {
          let title = `ConverterOptions loading error:\n${response.status} - ${response.statusText}`;
          title += `\ndevice_id: ${device_id}`;
          let severity = 'error';
          setAlert((prev) => ({ title: title, severity: severity }));
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshConverterOptions = React.useCallback(
    (device_id: number) => {
      setConverterOptionsIsLoading((prev) => true);
      loadConverterOptions(device_id)
        .then((result) => {
          setConverterOptions((prev) => result);
        })
        .finally(() => {
          setConverterOptionsIsLoading((prev) => false);
        });
    },
    [loadConverterOptions]
  );
  React.useEffect(() => {
    if (device?.id === undefined) {
      return;
    }
    refreshConverterOptions(device.id);
  }, [refreshConverterOptions, device]);

  if (device?.id === undefined) {
    return null;
  }
  return (
    <div className="gf-form gf-form--grow">
      <Select
        disabled={!(conv_SubDev === -1 || conv_SubDev === ConverterID)}
        prefix="Converter: "
        placeholder=""
        isLoading={converterOptionsIsLoading}
        isClearable={converterIsClearable}
        options={converterOptions}
        value={converter}
        onChange={(e) => {
          if (e === null) {
            setConv_SubDev((prev) => -1);
            setConverterIsClearable((prev) => false);
            setConverter((prev) => EmptySelectableValue);
          } else {
            setConv_SubDev((prev) => ConverterID);
            setConverterIsClearable((prev) => true);
            setConverter((prev) => e);
          }
        }}
      />
    </div>
  );
};
