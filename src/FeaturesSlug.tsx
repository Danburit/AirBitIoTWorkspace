import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { EmptySelectableValue } from './constance';

const debugFS = false;
export const FeaturesSlug = ({ setAlert, datasource, featuresSlug, setFeaturesSlug, query }) => {
  debugFS && console.log('========================================');
  debugFS && console.log('FeaturesSlug');
  const [featuresSlugOptions, setFeaturesSlugOptions] = React.useState<Array<SelectableValue<number>>>([]);
  const [featuresSlugOptionsIsLoading, setFeaturesSlugOptionsIsLoading] = React.useState<boolean>(false);
  const [featuresSlugIsClearable, setFeaturesSlugIsClearable] = React.useState<boolean>(false);

  debugFS && console.log('featuresSlug', featuresSlug);
  debugFS && console.log('featuresSlugOptions', featuresSlugOptions);

  const loadFeaturesSlugOptions = React.useCallback(() => {
    return datasource.featureSetFindQuery().then(
      (result: any) => {
        return result.map((value: any) => ({ label: value.text, value: value.value }));
      },
      (response: any) => {
        setAlert({
          title: `Features set loading error:\n${response.status} - ${response.statusText}`,
          severity: 'error',
        });
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
  }, [setAlert, loadFeaturesSlugOptions, setFeaturesSlugOptionsIsLoading, setFeaturesSlugOptions]);
  // React.useEffect(() => {
  //   refreshFeaturesSlugOptions();
  // }, [refreshFeaturesSlugOptions]);

  return (
    <div className="gf-form">
      <Select
        value={featuresSlug}
        options={featuresSlugOptions}
        prefix="Features slug: "
        placeholder=""
        onChange={(v) => {
          setFeaturesSlug(v === null ? EmptySelectableValue : v);
        }}
        isClearable={featuresSlugIsClearable}
        isLoading={featuresSlugOptionsIsLoading}
      />
    </div>
  );
};
