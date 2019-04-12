import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkInfo, NetworkStatus, OfflineQueueListener, OfflineRestoreHandler } from "../offline";
import { OfflineQueue } from "../offline/OfflineQueue";
import { ObjectState } from "../conflicts";
import { isMarkedOffline, markOffline } from "../utils/helpers";
import { OperationQueueEntry } from "../offline/OperationQueueEntry";

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
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

  private queue: OfflineQueue;
  private readonly networkStatus: NetworkStatus;
  private online: boolean = false;
  private offlineMutationHandler?: OfflineRestoreHandler;
  private client: any;

  constructor(options: OfflineLinkOptions) {
    super();
    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
  }

  public request(operation: Operation, forward: NextLink) {
    // Reatempting operation that was marked as offline
    if (isMarkedOffline(operation)) {
      return this.queue.enqueue(operation, forward);
    }

    if (!this.online) {
      const operationEntry = new OperationQueueEntry(operation, forward);
      if (this.offlineMutationHandler) {
        markOffline(operationEntry.operation);
        this.offlineMutationHandler.mutateOfflineElement(operationEntry);
      }
      return new Observable(observer => {
        observer.error({ isOffline: true });
        return () => { return; };
      });
    }
    // We are online and can skip this link;
    return forward(operation);
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
