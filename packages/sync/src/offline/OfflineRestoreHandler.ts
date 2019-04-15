import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import { DataSyncConfig } from "../config";
import CacheUpdates from "../cache/CacheUpdates";
import { getMutationName } from "../utils/helpers";
import { Operation } from "apollo-link";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

/**
 * Class used to restore offline queue after page/application restarts.
 * It will trigger saved offline mutations using client to
 * restore all elements in the link.
 */
export class OfflineRestoreHandler {

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private storage: PersistentStore<PersistedData>;
  private readonly storageKey: string;
  private mutationCacheUpdates?: CacheUpdates;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>, clientConfig: DataSyncConfig) {
    this.apolloClient = apolloClient;
    this.storage = clientConfig.storage as PersistentStore<PersistedData>;
    this.storageKey = clientConfig.mutationsQueueName;
    this.mutationCacheUpdates = clientConfig.mutationCacheUpdates;
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    const stored = await this.getOfflineData();
    let offlineData;
    if (stored) {
      offlineData = JSON.parse(stored.toString());
    } else {
      offlineData = [];
    }
    // if there is no offline data  then just exit
    if (!this.hasOfflineData(offlineData)) { return; }

    logger("Replying offline mutations after application restart");
    for (const item of offlineData) {
      await this.mutateOfflineElement(item);
    }
  }

  /**
   * Perform mutation using client replicating parameters that user provided into
   *
   * @param item
   */
  public async mutateOfflineElement(item: OperationQueueEntry) {
    const optimisticResponse = item.optimisticResponse;
    const mutationName = getMutationName(item.operation.query);
    let updateFunction;
    if (this.mutationCacheUpdates && mutationName) {
      updateFunction = this.mutationCacheUpdates[mutationName];
    }
    const mutationOptions = {
      variables: item.operation.variables,
      mutation: item.operation.query,
      // Restore optimistic response from operation in order to see it
      optimisticResponse,
      // Pass client update functions
      update: updateFunction,
      // Pass extensions as part of the context
      context: this.getOfflineContext()
    };
    await this.apolloClient.mutate(mutationOptions);
  }

  /**
   * Check if operation was done when offline
   */
  public getOfflineContext() {
    return { madeOffline: true };
  }

  /**
   * Checks if operation was scheduled to saved to offline queue.
   * This operations have special handling.
   * They are never forwarded when sent back again to client.
   */
  // tslint:disable-next-line:member-ordering
  public static isMarkedOffline(operation: Operation) {
    return !!operation.getContext().madeOffline;
  }

  private getOfflineData = async () => {
    return this.storage.getItem(this.storageKey);
  }

  private hasOfflineData(offlineData: OperationQueueEntry[]) {
    return (offlineData && offlineData.length > 0);
  }
}
