import { DeviceValue } from '../types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { QueryDeviceTripletNetID } from './QueryDeviceTripletNetID';
import { QueryDeviceTripletTypeNetID } from './QueryDeviceTripletTypeNetID';
import { QueryDeviceTripletCompany } from './QueryDeviceTripletCompany';
import { Format } from '../format';
import { EmptySelectableValue } from '../constance';

export const QueryDeviceTriplet = ({
  group,
  featuresSlug,
  setAlert,
  queryMode,
  device,
  datasource,
  setDevice,
  address,
}) => {
  const [netID, setNetID] = React.useState<string>(device?.net_id ?? '');
  const [typeNetID, setTypeNetID] = React.useState<SelectableValue<number>>(EmptySelectableValue);
  const [useCompany, setUseCompany] = React.useState<boolean>(false);
  const [company, setCompany] = React.useState<SelectableValue<number>>(EmptySelectableValue);

  const loadDevice = React.useCallback(
    (
      net_id: string,
      net_id_type_id: number,
      company_id?: number,
      group?: number,
      features_slug?: number,
      address?: number
    ) => {
      let data: {
        net_id: string;
        net_id_type_id: number;
        company_id?: number | null;
        group?: number;
        features_slug?: number;
        address?: number;
      } = {
        net_id: net_id,
        net_id_type_id: net_id_type_id,
      };
      if (useCompany && company_id !== undefined) {
        data.company_id = company_id;
      }
      if (group !== undefined) {
        data.group = group;
      }
      if (features_slug !== undefined) {
        data.features_slug = features_slug;
      }
      if (address !== undefined) {
        data.address = address;
      }
      return datasource.deviceByNetIDFindQuery(data).then(
        (result: DeviceValue) => {
          return result;
        },
        (response: any) => {
          let title = `DeviceByNet loading error:\n${response.status} - ${response.statusText}`;
          title += `\nnet_id: ${net_id}`;
          title += `\nnet_id_type_id: ${net_id_type_id}`;
          if (useCompany && company_id !== undefined) {
            title += `\ncompany_id: ${company_id}`;
          }
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
          setAlert({ title: title, severity: severity });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource, useCompany]
  );
  const refreshDevice = React.useCallback(
    (
      net_id: string,
      net_id_type_id: number,
      company_id?: number,
      group?: number,
      features_slug?: number,
      address?: number
    ) => {
      loadDevice(net_id, net_id_type_id, company_id, group, features_slug, address).then((result) => {
        if (result?.id === undefined) {
          let title = `Device:\nUnknown device:`;
          title += `\nnetID: ${net_id}`;
          title += `\ntypeNetID: ${net_id_type_id}`;
          if (company_id !== undefined) {
            title += `\ncompany: ${company_id}`;
          }
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
          setAlert({ title: title, severity: severity });
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

    refreshDevice(netID, typeNetID.value, company?.value, group?.value, featuresSlug?.value, address?.value);
  }, [refreshDevice, netID, typeNetID, company, group, featuresSlug, address]);

  const checkUseCompany = React.useCallback(() => {
    return datasource.userCheckQuery().then(
      (result: any) => {
        return result?.is_super ?? false;
      },
      (response: any) => {
        setUseCompany((prev) => false);
        let title = `Checking using company error:\n${response.status} - ${response.statusText}`;
        let severity = 'error';
        setAlert((prev) => ({ title: title, severity: severity }));
        throw new Error(response.statusText);
      }
    );
  }, [datasource]);

  React.useEffect(() => {
    checkUseCompany().then((is_super: boolean) => {
      setUseCompany((prev) => is_super);
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
