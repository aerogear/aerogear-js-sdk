import {
  ApolloLink,
  Operation,
  NextLink
} from "apollo-link";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OperationQueue } from "../offline/OperationQueue";
import { hasDirectives } from "apollo-utilities";
import { localDirectives } from "../config/Constants";
import { OfflineQueueListener } from "../offline";

export interface SerialLinkOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  squashOperations?: boolean;
  listener?: OfflineQueueListener;
}

export class SerialLink extends ApolloLink {
  private queue: OperationQueue;
  private open: boolean = true;

  constructor(options: SerialLinkOptions) {
    super();

    this.queue = new OperationQueue(options);

    this.handleEnqueue = this.handleEnqueue.bind(this);
  }

  public request(operation: Operation, forward: NextLink) {
    return this.queue.enqueue(operation, forward, this.handleEnqueue);
  }

  private handleEnqueue() {
    if (this.open) {
      this.forward();
    }
  }

  private async forward() {
    this.open = false;

    while (this.queue.toBeForwarded().length > 0) {
      const operationEntry = this.queue.toBeForwarded()[0];
      const query = operationEntry.operation.query;

      if (hasDirectives([localDirectives.PARALLEL], query)) {
        operationEntry.forwardOperation();
      } else {
        await operationEntry.forwardOperation();
      }
    }

    this.open = true;
  }
}
