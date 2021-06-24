import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { EmptySelectableValue } from '../constance';
import { find } from 'lodash';

export const FeaturesSlug = ({ setAlert, datasource, featuresSlug, setFeaturesSlug, query }) => {
  const [featuresSlugOptions, setFeaturesSlugOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [featuresSlugOptionsIsLoading, setFeaturesSlugOptionsIsLoading] = React.useState<boolean>(false);
  const [featuresSlugIsClearable, setFeaturesSlugIsClearable] = React.useState<boolean>(false);

  const loadFeaturesSlugOptions = React.useCallback(() => {
    return datasource.featureSetFindQuery().then(
      (result: any) => {
        let r = result.map((value: any) => ({ label: value.text, value: value.value }));
        let f = find(r, (v) => v.value === query?.lastQuery?.featuresSlug?.value) ?? EmptySelectableValue;
        setFeaturesSlugIsClearable(f !== EmptySelectableValue);
        setFeaturesSlug(f);
        return r;
      },
      (response: any) => {
        let title = `Features set loading error:\n${response.status} - ${response.statusText}`;
        let severity = 'error';
        setAlert({ title: title, severity: severity });
        throw new Error(response.statusText);
      }
    );
  }, [datasource]);
  const refreshFeaturesSlugOptions = React.useCallback(() => {
    setFeaturesSlugOptionsIsLoading(true);
    loadFeaturesSlugOptions()
      .then((result) => {
        setFeaturesSlugOptions(result);
      })
      .finally(() => {
        setFeaturesSlugOptionsIsLoading(false);
      });
  }, [loadFeaturesSlugOptions, setFeaturesSlugOptionsIsLoading, setFeaturesSlugOptions]);
  React.useEffect(() => {
    refreshFeaturesSlugOptions();
  }, [refreshFeaturesSlugOptions]);

  return (
    <div className="gf-form">
      <Select
        value={featuresSlug}
        options={featuresSlugOptions}
        prefix="Feature set: "
        placeholder=""
        onChange={(v) => {
          if (v === null) {
            setFeaturesSlugIsClearable(false);
            setFeaturesSlug(EmptySelectableValue);
          } else {
            setFeaturesSlugIsClearable(true);
            setFeaturesSlug(v);
          }
        }}
        isClearable={featuresSlugIsClearable}
        isLoading={featuresSlugOptionsIsLoading}
      />
    </div>
  );
};
