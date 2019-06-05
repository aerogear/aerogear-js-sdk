import { Store } from "idb-localstorage";
import { persistCache } from "apollo-cache-persist";
import { InMemoryCache, defaultDataIdFromObject, NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "./PersistentStore";
import ApolloClient from "apollo-client";

export const createDefaultCacheStorage = () => {
  return new Store("apollo-cache", "cache-store");
};

export const createDefaultOfflineStorage = () => {
  return new Store("offline-store", "offline-data");
};

/**
 * Function that return object id's
 * Using default Apollo data Id function
 */
export const dataIdFromObject = defaultDataIdFromObject;

/**
 *
 */
export const getObjectFromCache = (cache: InMemoryCache, id: string, type: string) => {
  const cacheData = cache.extract(false);
  const idKey = dataIdFromObject({ __typename: type, id });
  if (idKey && cacheData[idKey]) {
    delete cacheData[idKey].__typename;
    return cacheData[idKey];
  }
  return {};
};

/**
 * Build storage that will be used for caching data
 */
export const buildCachePersistence = async (store: PersistentStore<PersistedData>) => {
  const cache = new InMemoryCache({
    dataIdFromObject
  });
  await persistCache({
    cache,
    serialize: false,
    storage: store,
    maxSize: false,
    debug: false
  });
  return cache;
};
