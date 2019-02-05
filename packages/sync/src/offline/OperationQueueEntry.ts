import { Operation, NextLink, FetchResult } from "apollo-link";
import { Observer } from "zen-observable-ts";

export class OperationQueueEntry {
  public readonly operation: Operation;
  public readonly forward: NextLink;
  public readonly observer: Observer<FetchResult>;
  public readonly optimisticResponse?: any;
  public subscription?: { unsubscribe: () => void };
  public result?: FetchResult;

  constructor(operation: Operation, forward: NextLink, observer: Observer<FetchResult>) {
    this.operation = operation;
    this.forward = forward;
    this.observer = observer;
    this.optimisticResponse = operation.getContext().optimisticResponse;
  }

  public forwardOperation() {
    const { operation, forward, observer } = this;
    const self = this;
    return new Promise(resolve => {
      this.subscription = forward(operation).subscribe({
        next: result => {
          self.result = result;
          if (observer.next) {
            observer.next(result);
          }
        },
        error: error => {
          if (observer.error) {
            observer.error(error);
          }
          resolve();
        },
        complete: () => {
          if (observer.complete) {
            observer.complete();
          }
          resolve(self.result);
        }
      });
    });
  }
}
