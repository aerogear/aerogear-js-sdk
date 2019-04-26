import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { createDefaultLink, createOfflineLink } from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { OfflineMutationsHandler } from "./offline/OfflineMutationsHandler";
import { OfflineLink } from "./offline/OfflineLink";
import { OfflineStore } from "./offline";

/**
 * @see ApolloClient
 */
export type VoyagerClient = ApolloClient<NormalizedCacheObject>;

export class OfflineClient {
  private client?: VoyagerClient;
  private offlineStore: OfflineStore;
  private config: DataSyncConfig;

  constructor(userConfig?: DataSyncConfig) {
    this.config = this.extractConfig(userConfig);
    this.offlineStore = new OfflineStore(this.config);
  }

  public getOfflineStore(): OfflineStore {
    return this.offlineStore;
  }

  /**
  * Factory for creating Apollo Client
  *
  * @param userConfig options object used to build client
  */
  public createClient = async (): Promise<VoyagerClient> => {
    const { cache } = await this.buildCachePersistence(this.config);
    const offlineLink = await createOfflineLink(this.config, this.offlineStore);
    const link = await createDefaultLink(this.config, offlineLink);

    const apolloClient = new ApolloClient({
      link,
      cache
    });
    await this.restoreOfflineOperations(apolloClient, this.config, offlineLink);
    return apolloClient;
  }
  /**
 * Extract configuration from user and external sources
 */
  private extractConfig(userConfig: DataSyncConfig | undefined) {
    const config = new SyncConfig(userConfig);
    const clientConfig = config.getClientConfig();
    return clientConfig;
  }

  /**
 * Restore offline operations into the queue
 */
  private async restoreOfflineOperations(
    apolloClient: ApolloClient<NormalizedCacheObject>,
    clientConfig: DataSyncConfig, offlineLink: OfflineLink) {

    const offlineMutationHandler = new OfflineMutationsHandler(apolloClient, clientConfig);
    offlineLink.setup(offlineMutationHandler);
    // Reschedule offline mutations for new client instance
    await offlineMutationHandler.replayOfflineMutations();
    // After pushing all online changes check and set network status
    await offlineLink.initOnlineState();
  }

  /**
 * Build storage that will be used for caching data
 *
 * @param clientConfig
 */
  private async buildCachePersistence(clientConfig: DataSyncConfig) {
    const cache = new InMemoryCache();
    await persistCache({
      cache,
      storage: clientConfig.storage as PersistentStore<PersistedData>,
      maxSize: false,
      debug: false
    });
    return { cache };
  }

}
