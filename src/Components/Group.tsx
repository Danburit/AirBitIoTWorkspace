import React from 'react';
import { SelectableValue } from '@grafana/data';
import { Select } from '@grafana/ui';
import { EmptySelectableValue } from '../constance';
import { find } from 'lodash';

export const Group = ({ setAlert, datasource, group, setGroup, query }) => {
  const [groupOptions, setGroupOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [groupOptionsIsLoading, setGroupOptionsIsLoading] = React.useState<boolean>(false);
  const [groupIsClearable, setGroupIsClearable] = React.useState<boolean>(false);

  const loadGroupOptions = React.useCallback(() => {
    return datasource.groupFindQuery().then(
      (result: any) => {
        let r = result.map((value: any) => ({ label: value.text, value: value.value }));
        let f = find(r, (v) => v.value === query?.lastQuery?.group?.value) ?? EmptySelectableValue;
        setGroupIsClearable((prev) => f !== EmptySelectableValue);
        setGroup((prev) => f);
        return r;
      },
      (response: any) => {
        let title = `GroupOptions loading error:\n${response.status} - ${response.statusText}`;
        let severity = 'error';
        setAlert((prev) => ({ title: title, severity: severity }));
        throw new Error(response.statusText);
      }
    );
  }, [datasource]);
  const refreshGroupOptions = React.useCallback(() => {
    setGroupOptionsIsLoading((prev) => true);
    loadGroupOptions()
      .then((result) => {
        setGroupOptions((prev) => result);
      })
      .finally(() => {
        setGroupOptionsIsLoading((prev) => false);
      });
  }, [loadGroupOptions, setGroupOptionsIsLoading, setGroupOptions]);
  React.useEffect(() => {
    refreshGroupOptions();
  }, [refreshGroupOptions]);

  return (
    <div className="gf-form">
      <Select
        prefix="Group: "
        placeholder=""
        isLoading={groupOptionsIsLoading}
        isClearable={groupIsClearable}
        options={groupOptions}
        value={group}
        onChange={(v) => {
          if (v === null) {
            setGroupIsClearable((prev) => false);
            setGroup((prev) => EmptySelectableValue);
          } else {
            setGroupIsClearable((prev) => true);
            setGroup((prev) => v);
          }
        }}
      />
    </div>
  );
};
