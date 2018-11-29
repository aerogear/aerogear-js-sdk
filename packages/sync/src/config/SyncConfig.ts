import { INSTANCE, ServiceConfiguration } from "@aerogear/core";
import { isMobileCordova } from "@aerogear/core";
import { CordovaNetworkStatus } from "../offline/CordovaNetworkStatus";
import { WebNetworkStatus } from "../offline/WebNetworkStatus";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { ConfigError } from "./ConfigError";
import { DataSyncConfig } from "./DataSyncConfig";
import { IdGetter } from "apollo-cache-inmemory";

declare var window: any;

// Legacy platform configuration that needs to be merged into sync configuration
const TYPE: string = "sync";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class SyncConfig implements DataSyncConfig {
  // Explicitly use id as id field
  public dataIdFromObject: IdGetter;
  public storage?: PersistentStore<PersistedData>;
  public mutationsQueueName = "offline-mutation-store";

  public networkStatus = (isMobileCordova()) ? new CordovaNetworkStatus() : new WebNetworkStatus();

  constructor() {
    if (window) {
      this.storage = window.localStorage;
    }
    this.dataIdFromObject = ({ __typename, id }) => __typename as string + id as string;
  }

  /**
   * Method used to join user configuration with defaults
   */
  public merge(clientOptions?: DataSyncConfig): DataSyncConfig {
    return Object.assign(this, clientOptions);
  }

  /**
   * Platform configuration that is generated and supplied by OpenShift
   *
   * @param config user supplied configuration
   */
  public applyPlatformConfig(config: DataSyncConfig) {
    const configuration = INSTANCE.getConfigByType(TYPE);
    if (configuration && configuration.length > 0) {
      const serviceConfiguration: ServiceConfiguration = configuration[0];
      config.httpUrl = serviceConfiguration.url;
    }
  }

  public validate(userConfig: DataSyncConfig) {
    if (!userConfig.httpUrl) {
      throw new ConfigError("Missing server URL", "httpUrl");
    }
  }
}
