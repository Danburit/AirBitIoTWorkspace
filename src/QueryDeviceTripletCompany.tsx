import { CompanyFindValue } from './types';
import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { Format } from './format';
import { EmptySelectableValue } from './constance';

export const QueryDeviceTripletCompany = ({
  setAlert,
  queryMode,
  device,
  useCompany,
  datasource,
  company,
  setCompany,
}) => {
  const [companyOptions, setCompanyOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [companyQr, setCompanyQr] = React.useState<string>('');
  const [companyOptionsIsLoading, setCompanyOptionsIsLoading] = React.useState<boolean>(false);
  const [companyIsClearable, setCompanyIsClearable] = React.useState<boolean>(false);

  const loadCompanyOptions = React.useCallback(
    (company_name: string) => {
      let data = {
        company_name: company_name,
      };
      return datasource.companyByNameFindQuery(data).then(
        (result: CompanyFindValue[]) => {
          // setCompanyIsClearable(false);
          // setCompany(EmptySelectableValue);
          return result.map((value: CompanyFindValue) => ({ label: value.text, value: value.value }));
        },
        (response: any) => {
          setAlert({
            title: `CompanyOptions loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshCompanyOptions = React.useCallback(
    (company_name: string) => {
      setCompanyOptionsIsLoading(true);
      loadCompanyOptions(company_name)
        .then((options: any) => {
          setCompanyOptions(options);
        })
        .finally(() => {
          setCompanyOptionsIsLoading(false);
        });
    },
    [loadCompanyOptions]
  );
  React.useEffect(() => {
    if (!useCompany || !companyQr) {
      return;
    }
    refreshCompanyOptions(companyQr);
  }, [refreshCompanyOptions, companyQr]);

  const loadCompany = React.useCallback(
    (company_id: number) => {
      let data: { company_id: number } = {
        company_id: company_id,
      };
      return datasource.companyByIDFindQuery(data).then(
        (result) => {
          return result.map((value: CompanyFindValue) => ({ label: value.text, value: value.value }));
        },
        (response: any) => {
          setAlert({
            title: `CompanyByID loading error:\n${response.status} - ${response.statusText}`,
            severity: 'error',
          });
          throw new Error(response.statusText);
        }
      );
    },
    [datasource]
  );
  const refreshCompany = React.useCallback(
    (company_id: number) => {
      setCompanyOptionsIsLoading(true);
      loadCompany(company_id)
        .then((result) => {
          setCompanyOptions(result);
          if (result.length) {
            setCompany(result[0]);
          }
        })
        .finally(() => {
          setCompanyOptionsIsLoading(false);
        });
    },
    [loadCompany]
  );
  React.useEffect(() => {
    if (device?.company_id === undefined || device?.company_id === company?.value) {
      return;
    }
    if (device.company_id === null) {
      setCompanyIsClearable(false);
      setCompany(EmptySelectableValue);
    } else {
      setCompanyIsClearable(true);
      refreshCompany(device.company_id);
    }
  }, [refreshCompany, device]);
  if (!useCompany || queryMode.value !== Format.DeviceNetID) {
    return null;
  }
  return (
    <>
      <div className="gf-form--grow">
        <Select
          prefix="Company: "
          isClearable={companyIsClearable}
          isLoading={companyOptionsIsLoading}
          value={company}
          options={companyOptions}
          onChange={(e) => {
            if (e === null) {
              setCompanyIsClearable(false);
              setCompany(EmptySelectableValue);
            } else {
              setCompanyIsClearable(true);
              setCompany(e);
            }
          }}
          onInputChange={(v) => {
            setCompanyQr(v);
          }}
        />
      </div>
    </>
  );
};
