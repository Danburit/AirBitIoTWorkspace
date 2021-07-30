import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { EmptySelectableValue } from '../constance';
import { AddressFindValue } from '../types';

export const Address = ({ setAlert, datasource, address, setAddress, query }) => {
  const [addressOptions, setAddressOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [addressQr, setAddressQr] = React.useState<string>('');
  const [addressOptionsIsLoading, setAddressOptionsIsLoading] = React.useState<boolean>(false);
  const [addressIsClearable, setAddressIsClearable] = React.useState<boolean>(address !== EmptySelectableValue);

  const loadAddressOptions = React.useCallback(
    (address_mask: string) => {
      let data = {
        address: address_mask,
      };
      return datasource.addressByNameFindQuery(data).then(
        (result: AddressFindValue[]) => {
          return result.map((value: AddressFindValue) => ({ label: value.text, value: value.value }));
        },
        (response: any) => {
          let title = `AddressOptions loading error:\n${response.status} - ${response.statusText}`;
          title += `\naddress_mask: ${address_mask}`;
          let severity = 'error';
          setAlert((prev) => ({ title: title, severity: severity }));
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshAddressOptions = React.useCallback(
    (address_mask: string) => {
      setAddressOptionsIsLoading((prev) => true);
      loadAddressOptions(address_mask)
        .then((options: any) => {
          setAddressOptions((prev) => options);
        })
        .finally(() => {
          setAddressOptionsIsLoading((prev) => false);
        });
    },
    [loadAddressOptions]
  );
  React.useEffect(() => {
    if (!addressQr) {
      return;
    }
    refreshAddressOptions(addressQr);
  }, [refreshAddressOptions, addressQr]);

  return (
    <div className="gf-form">
      <Select
        prefix="Address: "
        placeholder=""
        isLoading={addressOptionsIsLoading}
        isClearable={addressIsClearable}
        options={addressOptions}
        value={address}
        onChange={(e) => {
          if (e === null) {
            setAddressIsClearable((prev) => false);
            setAddress((prev) => EmptySelectableValue);
          } else {
            setAddressIsClearable((prev) => true);
            setAddress((prev) => e);
          }
        }}
        onInputChange={(v) => {
          setAddressQr((prev) => v);
        }}
      />
    </div>
  );
};
