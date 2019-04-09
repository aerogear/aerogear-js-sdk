import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import { DataSyncConfig } from "../config";
import CacheUpdates from "../cache/CacheUpdates";
import { getMutationName } from "../utils/helpers";

export const logger = debug.default(MUTATION_QUEUE_LOGGER);

/**
 * Class used to restore offline queue after page/application restarts.
 * It will trigger saved offline mutations using client to
 * restore all elements in the link.
 */
export class OfflineRestoreHandler {

  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private offlineStorage: LocalForage;
  private mutationCacheUpdates?: CacheUpdates;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>, clientConfig: DataSyncConfig) {
    this.apolloClient = apolloClient;
    this.offlineStorage = clientConfig.offlineStorage as LocalForage;
    this.mutationCacheUpdates = clientConfig.mutationCacheUpdates;
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    logger("Replaying offline mutations after application restart");
    this.offlineStorage.iterate((value: any, key, iterationNumber) => {
      const item = JSON.parse(value);
      const extensions = item.operation.extensions;
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
        context: { extensions }
      };
      this.apolloClient.mutate(mutationOptions);
    });
  }

}
