import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkInfo, NetworkStatus, OfflineQueueListener, OfflineRestoreHandler, OfflineStore } from "../offline";
import { OfflineQueue } from "../offline/OfflineQueue";
import { ObjectState } from "../conflicts";
import { OperationQueueEntry } from "../offline/OperationQueueEntry";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../config/Constants";

export const logger = debug.default(QUEUE_LOGGER);

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  store: OfflineStore;
  listener?: OfflineQueueListener;
  conflictStateProvider?: ObjectState;
}

/**
 * Apollo link implementation used to queue graphql requests.
 *
 * Link will push every incoming operation to queue.
 * All operations that are ready (i.e. they don't use client
 * generated ID) are forwarded to next link when:
 *
 * - client goes online
 * - there is a new operation and client is online
 * - operation was completed (which could result in ID updates, i.e. new
 *   operations ready to be forwarded - see OfflineQueue class)
 */
export class OfflineLink extends ApolloLink {

  private online: boolean = false;
  private queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;
  private offlineMutationHandler?: OfflineRestoreHandler;

  constructor(options: OfflineLinkOptions) {
    super();
    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
  }

  public request(operation: Operation, forward: NextLink) {
    // Reattempting operation that was marked as offline
    if (OfflineRestoreHandler.isMarkedOffline(operation)) {
      logger("Enqueueing offline mutation", operation.variables);
      return this.queue.enqueue(operation, forward);
    }

    if (this.online) {
      logger("Online: Forwarding mutation", operation.variables);
      // We are online and can skip this link;
      return forward(operation);
    }

    if (!this.offlineMutationHandler) {
      logger("Error: Offline link setup method was not called");
      return forward(operation);
    }

    const operationEntry = new OperationQueueEntry(operation, forward);
    this.offlineMutationHandler.mutateOfflineElement(operationEntry);
    return new Observable(observer => {
      logger.log("Returning error to client", operation.variables);
      observer.error({ isOffline: true });
      return () => { return; };
    });
  }

  /**
   * Force forward offline operations
   */
  public async forwardOfflineOperations() {
    await this.queue.forwardOperations();
  }

  public async initOnlineState() {
    const queue = this.queue;
    const self = this;
    this.online = !(await this.networkStatus.isOffline());
    if (this.online) {
      queue.forwardOperations();
    }
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
        if (self.online) {
          queue.forwardOperations();
        }
      }
    });
  }

  public setup(handler: OfflineRestoreHandler) {
    this.offlineMutationHandler = handler;
  }
}
