import { DeviceValue } from './types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { QueryDeviceTripletNetID } from './QueryDeviceTripletNetID';
import { QueryDeviceTripletTypeNetID } from './QueryDeviceTripletTypeNetID';
import { QueryDeviceTripletCompany } from './QueryDeviceTripletCompany';
import { Format } from './format';
import { EmptySelectableValue } from './constance';

export const QueryDeviceTriplet = ({ group, featuresSlug, setAlert, queryMode, device, datasource, setDevice }) => {
  const [netID, setNetID] = React.useState<string>(device?.net_id ?? '');
  const [typeNetID, setTypeNetID] = React.useState<SelectableValue<number>>(EmptySelectableValue);
  const [useCompany, setUseCompany] = React.useState<boolean>(false);
  const [company, setCompany] = React.useState<SelectableValue<number>>(EmptySelectableValue);

  const loadDevice = React.useCallback(
    (net_id: string, net_id_type_id: number, company_id?: number, group?: number, features_slug?: number) => {
      let data: {
        net_id: string;
        net_id_type_id: number;
        company_id?: number | null;
        group?: number;
        features_slug?: number;
      } = {
        net_id: net_id,
        net_id_type_id: net_id_type_id,
      };
      if (useCompany && company_id !== undefined) {
        data.company_id = company_id;
      }
      if (group !== undefined) {
        data['group'] = group;
      }
      if (features_slug !== undefined) {
        data['features_slug'] = features_slug;
      }
      return datasource.deviceByNetIDFindQuery(data).then(
        (result: DeviceValue) => {
          return result;
        },
        (response: any) => {
          setAlert({
            title: `DeviceByNet loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource, useCompany]
  );
  const refreshDevice = React.useCallback(
    (net_id: string, net_id_type_id: number, company_id?: number, group?: number, features_slug?: number) => {
      loadDevice(net_id, net_id_type_id, company_id, group, features_slug).then((result) => {
        if (result?.id === undefined) {
          setAlert({
            title:
              `Device:\nUnknown device:\nnetID: ${net_id}\ntypeNetID: ${net_id_type_id}\n` +
              `${company_id !== undefined ? 'company: ' + company_id + '\n' : ''}`,
            severity: 'warning',
          });
          return;
        }
        setDevice(result);
      });
    },
    [loadDevice, setDevice]
  );
  React.useEffect(() => {
    if (netID === '' || typeNetID?.value === undefined || queryMode.value !== Format.DeviceNetID) {
      return;
    }

    if (
      device?.net_id === netID &&
      device?.net_id_type_id === typeNetID?.value &&
      device?.company_id === company?.value
    ) {
      return;
    }

    refreshDevice(netID, typeNetID.value, company?.value, group?.value, featuresSlug?.value);
  }, [refreshDevice, netID, typeNetID, company, group, featuresSlug]);

  const checkUseCompany = React.useCallback(() => {
    return datasource.userCheckQuery().then(
      (result: any) => {
        return result?.is_super ?? false;
      },
      (response: any) => {
        setUseCompany(false);
        setAlert({
          title: `Checking using company error:\n${response.status} - ${response.statusText}`,
          severity: 'error',
        });
        throw new Error(response.statusText);
      }
    );
  }, [datasource]);

  React.useEffect(() => {
    checkUseCompany().then((is_super: boolean) => {
      setUseCompany(is_super);
    });
  }, [checkUseCompany]);

  return (
    <>
      <div className="gf-form gf-form-inline--nowrap">
        <QueryDeviceTripletNetID
          setAlert={setAlert}
          queryMode={queryMode}
          device={device}
          netID={netID}
          setNetID={setNetID}
        />
        <QueryDeviceTripletTypeNetID
          setAlert={setAlert}
          queryMode={queryMode}
          device={device}
          typeNetID={typeNetID}
          setTypeNetID={setTypeNetID}
          datasource={datasource}
        />
        <QueryDeviceTripletCompany
          setAlert={setAlert}
          queryMode={queryMode}
          device={device}
          useCompany={useCompany}
          datasource={datasource}
          company={company}
          setCompany={setCompany}
        />
      </div>
    </>
  );
};
