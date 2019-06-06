import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { NetworkInfo, NetworkStatus, OfflineMutationsHandler, OfflineStore } from ".";
import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { OfflineQueue } from "./OfflineQueue";
import * as debug from "debug";
import { QUEUE_LOGGER } from "../config/Constants";
import { OfflineError } from "./OfflineError";
import { IResultProcessor } from "./procesors/IResultProcessor";
import { getObjectFromCache } from "./storage/defaultStorage";
import { InMemoryCache } from "apollo-cache-inmemory";
import { BaseStateProvider } from "../conflicts/base/BaseStateProvider";

export const logger = debug.default(QUEUE_LOGGER);

export interface OfflineLinkOptions {
  networkStatus: NetworkStatus;
  store: OfflineStore;
  listener?: OfflineQueueListener;
  resultProcessors?: IResultProcessor[];
  cache: InMemoryCache;
  baseProvider: BaseStateProvider;
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
  private offlineMutationHandler?: OfflineMutationsHandler;
  private cache: InMemoryCache;
  private baseProvider: BaseStateProvider;

  constructor(options: OfflineLinkOptions) {
    super();
    this.networkStatus = options.networkStatus;
    this.queue = new OfflineQueue(options);
    this.cache = options.cache;
    this.baseProvider = options.baseProvider;
  }

  public request(operation: Operation, forward: NextLink) {
    // Reattempting operation that was marked as offline
    if (OfflineMutationsHandler.isMarkedOffline(operation)) {
      logger("Enqueueing offline mutation", operation.variables);
      return this.queue.enqueueOfflineChange(operation, forward);
    }
    if (this.online) {
      logger("Online: Forwarding mutation", operation.variables);
      // We are online and can skip this link;
      // first time seeing this, need to save, no persist
      this.saveToProvider(operation, false);
      // need to then follow this observable and clean up once it lands
      // return forward(operation);
      return forward(operation).map(data => {
        this.baseProvider.delete(operation.toKey());
        return data;
      });
    }
    // first time seeing this, need to persist as i am offline
    this.saveToProvider(operation, true);

    if (!this.offlineMutationHandler) {
      logger("Error: Offline link setup method was not called");
      return forward(operation);
    }
    const handler = this.offlineMutationHandler;
    return new Observable(observer => {
      this.queue.persistItemWithQueue(operation).then((operationEntry) => {
        // Send mutation request again
        const offlineMutation = handler.mutateOfflineElement(operationEntry);
        logger("Returning offline error to client", operation.variables);
        observer.error(new OfflineError(offlineMutation));
      });
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

  public setup(handler: OfflineMutationsHandler) {
    this.offlineMutationHandler = handler;
  }

  public saveToProvider(operation: Operation, persist: boolean) {
    const context = operation.getContext();
    const base = getObjectFromCache(this.cache, operation.variables.id, context.returnType);
    if (persist) {
      this.baseProvider.save(base, operation.toKey(), true);
    } else {
      this.baseProvider.save(base, operation.toKey(), false);
    }
  }
}
