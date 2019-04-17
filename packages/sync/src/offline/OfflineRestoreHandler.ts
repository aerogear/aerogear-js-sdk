import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { OperationQueueEntry, OfflineItem } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import { DataSyncConfig } from "../config";
import CacheUpdates from "../cache/CacheUpdates";
import { getMutationName } from "../utils/helpers";
import { Operation } from "apollo-link";
import { OfflineStore } from "./OfflineStore";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

/**
 * Class used to send offline changes again after error is sent to user or after application restart.
 * It will trigger saved offline mutations using client to restore all elements in the link.
 */
// TODO rename
export class OfflineRestoreHandler {

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private store: OfflineStore;
  private mutationCacheUpdates?: CacheUpdates;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>, clientConfig: DataSyncConfig) {
    this.apolloClient = apolloClient;
    this.mutationCacheUpdates = clientConfig.mutationCacheUpdates;
    this.store = new OfflineStore(clientConfig);
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    const offlineData = await this.store.getOfflineData();
    // if there is no offline data  then just exit
    if (offlineData.length === 0) { return; }

    logger("Replying offline mutations after application restart");
    for (const item of offlineData) {
      await this.mutateOfflineElement(item, false);
    }
  }

  /**
   * Perform mutation using client replicating parameters that user provided into
   *
   * @param item - item to save
   * @param blocking - await for offline response or just enqueue change if false
   */
  public async mutateOfflineElement(item: OfflineItem, blocking: boolean = true) {
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
      context: this.getOfflineContext(blocking)
    };
    return await this.apolloClient.mutate(mutationOptions);
  }

  /**
   * Add info to operation that was done when offline
   */
  public getOfflineContext(blocking: boolean) {
    return { isOffline: true, isBlockingOffline: blocking };
  }

  /**
   * Checks if operation was scheduled again (offline change)
   */
  // tslint:disable-next-line:member-ordering
  public static isMarkedOffline(operation: Operation) {
    return !!operation.getContext().isOffline;
  }

  /**
   * Check if operation should await till offline request is sent
   */
  // tslint:disable-next-line:member-ordering
  public static isBlocking(operation: Operation) {
    return !!operation.getContext().isBlockingOffline;
  }
}
