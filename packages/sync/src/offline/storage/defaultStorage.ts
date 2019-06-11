import { Store } from "idb-localstorage";
import { persistCache } from "apollo-cache-persist";
import { InMemoryCache, defaultDataIdFromObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "./PersistentStore";

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
 * Reads object from cache
 */
export const getObjectFromCache = (cache: InMemoryCache, id: string, type: string) => {
  // FIXME test with cacheData.cache.cache[key]
  const cacheData = cache.extract(false);
  const idKey = dataIdFromObject({ __typename: type, id });
  if (idKey && cacheData[idKey]) {
    return Object.assign({}, cacheData[idKey])
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
