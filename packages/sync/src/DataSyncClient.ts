import { DataSyncConfig } from "./config";
import { createDefaultLink } from "./links/LinksBuilder";

import { OfflineClient, ApolloOfflineClient } from "offix-client";

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
  const offlineClient = new OfflineClient(userConfig);
  const terminatingLink = await createDefaultLink(offlineClient.config);
  offlineClient.config.terminatingLink = terminatingLink;
  await offlineClient.init();
  return offlineClient;
};
