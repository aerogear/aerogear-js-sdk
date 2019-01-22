import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OperationQueueEntry } from "../links/OfflineQueueLink";
import { MUTATION_QUEUE_LOGGER } from "../config/Constants";
import * as debug from "debug";
import ProxyUpdate from "../ProxyUpdate";
import { getMutationName } from "../utils/helpers";

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
  private offlineData: OperationQueueEntry[] = [];
  private readonly proxyUpdate?: ProxyUpdate;

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>,
              storage: PersistentStore<PersistedData>,
              storageKey: string,
              proxyUpdate?: ProxyUpdate) {
    this.apolloClient = apolloClient;
    this.storage = storage;
    this.storageKey = storageKey;
    this.proxyUpdate = proxyUpdate;
  }

  /**
   * Replay mutations to client.
   * This operation will help to rebuild Apollo Link observer chain
   * after page refresh/app restart
   */
  public replayOfflineMutations = async () => {
    const stored = await this.getOfflineData();
    if (stored) {
      this.offlineData = JSON.parse(stored.toString()).slice();
    } else {
      this.offlineData = [];
    }
    // if there is no offline data  then just exit
    if (!this.hasOfflineData()) { return; }

    logger("Replying offline mutations after application restart");

    this.storage.setItem(this.storageKey, JSON.stringify([]));

    this.offlineData.forEach(item => {
      let updateFn;
      const mutationName = getMutationName(item.operation.query);
      if (this.proxyUpdate && mutationName) {
        updateFn = this.proxyUpdate(mutationName);
      }

      this.apolloClient.mutate({
        variables: { ...item.operation.variables, __replayOfflineMutation: true },
        mutation: item.operation.query,
        optimisticResponse: item.optimisticResponse,
        update: updateFn
      });
    });
  }

  private getOfflineData = async () => {
    return this.storage.getItem(this.storageKey);
  }

  private hasOfflineData() {
    return (this.offlineData && this.offlineData.length > 0);
  }
}
