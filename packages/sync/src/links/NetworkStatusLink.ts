import {
  ApolloLink,
  Operation,
  NextLink
} from "apollo-link";
import { OperationQueue } from "../offline/OperationQueue";
import { NetworkStatus, NetworkInfo } from "../offline";

export class NetworkStatusLink extends ApolloLink {
  private queue: OperationQueue;
  private readonly networkStatus: NetworkStatus;
  private online: boolean = false;

  constructor(networkStatus: NetworkStatus) {
    super();

    this.queue = new OperationQueue({});
    this.networkStatus = networkStatus;

    this.handleEnqueue = this.handleEnqueue.bind(this);

    this.forwardOnOnline();
  }

  public request(operation: Operation, forward: NextLink) {
    return this.queue.enqueue(operation, forward, this.handleEnqueue);
  }

  private handleEnqueue() {
    if (this.online) {
      this.forward();
    }
  }

  private async forward() {
    while (this.queue.toBeForwarded().length > 0) {
      this.queue.toBeForwarded()[0].forwardOperation();
    }
  }

  private async forwardOnOnline() {
    this.online = !(await this.networkStatus.isOffline());

    const self = this;
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
        if (self.online) {
          self.forward();
        }
      }
    });
  }
}
