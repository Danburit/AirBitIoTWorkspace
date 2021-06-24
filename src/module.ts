import { DataSourcePlugin } from '@grafana/data';
import { ConfigEditor } from './Components/ConfigEditor';
import { DataSource } from './DataSource';
import { QueryEditor } from './Components/QueryEditor';
import { GenericOptions, GrafanaQuery } from './types';

export const plugin = new DataSourcePlugin<DataSource, GrafanaQuery, GenericOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
