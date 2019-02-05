import { Operation, NextLink, Observable } from "apollo-link";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { hasClientGeneratedId } from "../cache/createOptimisticResponse";
import { squashOperations } from "./squashOperations";
import { OfflineQueueListener } from "./OfflineQueueListener";

export interface OperationQueueOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  squashOperations?: boolean;
  listener?: OfflineQueueListener;
}

export class OperationQueue {
  private queue: OperationQueueEntry[] = [];
  private readonly storage?: PersistentStore<PersistedData>;
  private readonly storageKey?: string;
  private readonly squashOperations?: boolean;
  private readonly listener?: OfflineQueueListener;

  constructor(options: OperationQueueOptions) {
    const { storage, storageKey, listener } = options;

    this.storage = storage;
    this.storageKey = storageKey;
    this.squashOperations = options.squashOperations;
    this.listener = listener;
  }

  public enqueue(operation: Operation, forward: NextLink, onEnqueue: () => void) {
    return new Observable(observer => {
      const operationEntry = new OperationQueueEntry(operation, forward, observer);
      if (this.squashOperations) {
        this.queue = squashOperations(operationEntry, this.queue);
      } else {
        this.queue.push(operationEntry);
      }
      this.persist();
      if (this.listener && this.listener.onOperationEnqueued) {
        this.listener.onOperationEnqueued(operationEntry);
      }
      onEnqueue();
      return () => this.dequeue(operationEntry);
    });
  }

  public toBeForwarded() {
    return this.queue.filter(op => !op.subscription);
  }

  private updateIds(entry: OperationQueueEntry) {
    const { operation: { operationName }, optimisticResponse, result } = entry;
    if (!result || !optimisticResponse || !hasClientGeneratedId(optimisticResponse, operationName)) {
      return;
    }

    const clientId = optimisticResponse && optimisticResponse[operationName].id;

    this.queue.forEach(({ operation: op }) => {
      if (op.variables.id === clientId) {
        op.variables.id = result.data && result.data[operationName].id;
      }
    });
  }

  private dequeue(entry: OperationQueueEntry) {
    this.updateIds(entry);

    const subscription = entry.subscription;
    if (subscription) {
      subscription.unsubscribe();
    }

    this.queue = this.queue.filter(e => e !== entry);

    this.persist();

    if (this.queue.length === 0 && this.listener && this.listener.queueCleared) {
      this.listener.queueCleared();
    }
  }

  private persist() {
    if (this.storage && this.storageKey) {
      this.storage.setItem(this.storageKey, JSON.stringify(this.queue));
    }
  }
}
