import { DataSyncConfig } from "./config";;
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
  Promise<DataSyncClient> => {
  const offlineClient = new DataSyncClient(userConfig);
  return offlineClient.init();
};

/**
 * OfflineClient
 *
 * Enables offline workflows, conflict resolution and cache
 * storage on top Apollo GraphQL JavaScript client.
 *
 * Usage:
 *
 *  ```javascript
 *  const offlineClient = new DataSyncClient(config);
 *  await offlineClient.init();
 *  ```
 */
export class DataSyncClient extends OfflineClient {

  constructor(userConfig: DataSyncConfig) {
    super(userConfig);
  }

  /**
   * Initialize client
   */
  public async init(): Promise<ApolloOfflineClient> {
    const terminatingLink = await createDefaultLink(this.config);
    this.config.terminatingLink = terminatingLink;
    return await super.init();
  }
}
