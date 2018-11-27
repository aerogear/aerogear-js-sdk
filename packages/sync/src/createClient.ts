import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient, ApolloClientOptions } from "apollo-client";
import { DataSyncConfig } from "./config/DataSyncConfig";
import { SyncConfig } from "./config/SyncConfig";
import { defaultLinkBuilder as buildLink } from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";

/**
 * Factory for creating Apollo Client
 *
 * @param userConfig options object used to build client
 */
export const createClient = async (userConfig?: DataSyncConfig, oldClient?: ApolloClient<NormalizedCacheObject>) => {
  const clientConfig = extractConfig(userConfig);
  const { cache } = await buildCachePersistence(clientConfig);
  const link = buildLink(clientConfig, oldClient);
  const apolloClient = new ApolloClient<NormalizedCacheObject>({
    link,
    cache
  });
  return apolloClient;
};

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: DataSyncConfig | undefined) {
  const config = new SyncConfig();
  const clientConfig = config.merge(userConfig);
  config.applyPlatformConfig(clientConfig);
  config.validate(config);
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
    storage: clientConfig.storage as PersistentStore<PersistedData>
  });
  return { cache };
}
