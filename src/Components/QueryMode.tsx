import { Select } from '@grafana/ui';
import { queryModeOptions } from '../constance';
import React from 'react';

export const QueryMode = ({ queryMode, setQueryMode }) => {
  return (
    <div className="gf-form">
      <Select
        isSearchable={false}
        prefix="Query mode: "
        options={queryModeOptions}
        defaultValue={queryMode}
        onChange={(v) => {
          setQueryMode(v);
        }}
      />
    </div>
  );
};
