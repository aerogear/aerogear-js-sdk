import { DataSyncConfig } from "./config";
import { createDefaultLink } from "./links/LinksBuilder";

import { OfflineClient } from "offix-client";
import { SyncConfig } from "./config/SyncConfig";

/**
* Factory for creating Apollo Offline Client
*
* @param userConfig options object used to build client
* @deprecated use OfflineClient class directly:
*  ```javascript
*  const offlineClient = new OfflineClient(config);
*  await offlineClient.init();
*  ```
*/
export const createClient = async (userConfig: DataSyncConfig):
  Promise<OfflineClient> => {
  const config = new SyncConfig(userConfig);
  config.terminatingLink = await createDefaultLink(config);
  const offlineClient = new OfflineClient(config);
  await offlineClient.init();
  return offlineClient;
};
