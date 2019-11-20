import { isMobileCordova } from "@aerogear/core";
import { ConfigError } from "./ConfigError";
import { DataSyncConfig } from "./DataSyncConfig";

import { AuthContextProvider } from ".";
import {
  OfflineQueueListener, VersionedState, PersistentStore,
  PersistedData,
  createDefaultOfflineStorage,
  CordovaNetworkStatus,
  WebNetworkStatus,
  UseClient,
  ConflictResolutionStrategy,
  NetworkStatus
} from "offix-client";
import { MutationOptions } from "apollo-client";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";

declare var window: any;

// Legacy platform configuration that needs to be merged into sync configuration
const TYPE: string = "sync-app";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class SyncConfig implements DataSyncConfig {
  public wsUrl?: string;
  public httpUrl?: string;
  public offlineQueueListener?: OfflineQueueListener<MutationOptions>;
  public authContextProvider?: AuthContextProvider;
  public fileUpload?: boolean;
  public auditLogging = false;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider = new VersionedState();
  public networkStatus: NetworkStatus;

  public cacheStorage: PersistentStore<PersistedData>;
  public offlineStorage?: PersistentStore<PersistedData>;
  public terminatingLink?: ApolloLink;

  public retryOptions = {
    delay: {
      initial: 1000,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 5
    }
  };

  constructor(clientOptions?: DataSyncConfig) {
    if (clientOptions && clientOptions.storage) {
      this.cacheStorage = clientOptions.storage;
      this.offlineStorage = clientOptions.storage;
    } else {
      this.cacheStorage = createDefaultCacheStorage();
      this.offlineStorage = createDefaultOfflineStorage();
    }
    this.networkStatus = (isMobileCordova()) ?
      new CordovaNetworkStatus() : new WebNetworkStatus();

    if (clientOptions && clientOptions.conflictStrategy) {
      this.conflictStrategy = clientOptions.conflictStrategy;
    } else {
      this.conflictStrategy = UseClient;
    }
    this.init(clientOptions);
  }

  private init(clientOptions?: DataSyncConfig) {
    Object.assign(this, clientOptions);
    this.validate();
  }

  private validate() {
    if (!this.httpUrl) {
      throw new ConfigError("Missing server URL", "httpUrl");
    }
  }
}
