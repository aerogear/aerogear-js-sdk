import { Store } from "idb-localstorage";
import { persistCache } from "apollo-cache-persist";
import { InMemoryCache, defaultDataIdFromObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { Operation } from "apollo-link";
import debug from "debug";

export const logger = debug.default("AeroGearSync:Storage");

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
export const getObjectFromCache = (operation: Operation, id: string) => {
  const context = operation.getContext();

  if (context.cache && context.cache.data) {
    const cacheData = context.cache.data.data;
    // TODO use context.getCacheKey()
    const idKey = dataIdFromObject({ __typename: context.returnType, id });
    if (idKey && cacheData[idKey]) {
      return Object.assign({}, cacheData[idKey]);
    }
  } else {
    logger("Client is missing cache implementation. Conflict features will not work properly");
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
