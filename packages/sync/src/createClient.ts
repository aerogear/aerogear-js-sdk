import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { createDefaultLink, createOfflineLink } from "./links/LinksBuilder";
import { OfflineRestoreHandler } from "./offline/OfflineRestoreHandler";
import { OfflineLink } from "./links/OfflineLink";
import { PersistentStorage, PersistedData } from "apollo-cache-persist/types";

/**
 * @see ApolloClient
 */
export type VoyagerClient = ApolloClient<NormalizedCacheObject>;

/**
 * Factory for creating Apollo Client
 *
 * @param userConfig options object used to build client
 */
export const createClient = async (userConfig?: DataSyncConfig): Promise<VoyagerClient> => {
  const clientConfig = extractConfig(userConfig);
  const { cache } = await buildCachePersistence(clientConfig);
  const offlineLink = await createOfflineLink(clientConfig);
  const link = await createDefaultLink(clientConfig, offlineLink);

  const apolloClient = new ApolloClient({
    link,
    cache
  });

  await restoreOfflineOperations(apolloClient, clientConfig, offlineLink);
  return apolloClient;
};

/**
 * Restore offline operations into the queue
 */
async function restoreOfflineOperations(apolloClient: ApolloClient<NormalizedCacheObject>,
                                        clientConfig: DataSyncConfig, offlineLink: OfflineLink) {
  const offlineMutationHandler = new OfflineRestoreHandler(apolloClient, clientConfig);
  // Reschedule offline mutations for new client instance
  await offlineMutationHandler.replayOfflineMutations();
  // After pushing all online changes check and set network status
  await offlineLink.initOnlineState();
}

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: DataSyncConfig | undefined) {
  const config = new SyncConfig(userConfig);
  const clientConfig = config.getClientConfig();
  return clientConfig;
}

/**
 * Build storage that will be used for caching data
 *
 * @param clientConfig
 */
async function buildCachePersistence(clientConfig: DataSyncConfig) {
  const cache = new InMemoryCache();
  await persistCache({
    cache,
    storage: clientConfig.storage as PersistentStorage<PersistedData<NormalizedCacheObject>>,
    maxSize: false,
    debug: false
  });
  return { cache };
}
