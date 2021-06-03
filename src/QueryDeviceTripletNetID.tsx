import { Format } from './format';
import React from 'react';
import { Input } from '@grafana/ui';

export const QueryDeviceTripletNetID = ({ setAlert, queryMode, device, netID, setNetID }) => {
  const [netIDStr, setNetIDStr] = React.useState<string>(netID || '');
  const refreshNetID = React.useCallback(
    (netID: string) => {
      setNetIDStr(netID);
      setNetID(netID);
    },
    [setNetID]
  );
  React.useEffect(() => {
    if (device?.net_id === undefined || device.net_id === netID) {
      return;
    }
    refreshNetID(device.net_id);
  }, [refreshNetID, device]);

  if (queryMode.value !== Format.DeviceNetID) {
    return null;
  }
  return (
    <div className="gf-form--grow">
      <Input
        value={netIDStr}
        onChange={(v) => {
          // @ts-ignore
          setNetIDStr(v.target.value);
        }}
        onBlur={() => {
          if (netIDStr !== '') {
            setNetID(netIDStr);
          }
        }}
        prefix={'Net ID: '}
      />
    </div>
  );
};
