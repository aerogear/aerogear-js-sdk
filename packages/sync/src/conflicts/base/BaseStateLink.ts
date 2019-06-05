
import { ApolloLink, NextLink, Operation, FetchResult } from "apollo-link";
import { BaseStateProvider } from "./BaseStateProvider";
import { InMemoryCache } from "apollo-cache-inmemory";
import { getObjectFromCache } from "../../offline/storage/defaultStorage";
import { NetworkStatus, NetworkInfo } from "../../offline/network/NetworkStatus";
import { isMutation } from "../../utils/helpers";
import { BaseStateStore } from "./BaseStateStore";

/**
 * Apollo link used to manage state of the objects before
 * they are sent to server. ObjectStates are used in conflicts to determine
 * difference between server and client data.
 *
 * @see BaseStateProvider for more information
 */
export class BaseStateLink extends ApolloLink {
  private online: boolean = false;
  private readonly networkStatus: NetworkStatus;

  constructor(private baseState: BaseStateProvider, private cache: InMemoryCache, networkStatus: NetworkStatus) {
    super();
    this.networkStatus = networkStatus;
  }

  public request(operation: Operation, forward?: NextLink) {
    const context = operation.getContext();
    const base = getObjectFromCache(this.cache, operation.variables.id, context.returnType);
    if (!base || !forward) {
      // TODO need a way to handle no base case
      return null;
    }
    if (!isMutation(operation)) {
      return forward(operation);
    }
    if (this.online) {
      this.baseState.save(base, operation.toKey(), false);
    } else {
      this.baseState.save(base, operation.toKey(), true);
    }
    return forward(operation).map(data => {
      this.baseState.delete(operation.toKey());
      return data;
    });
  }

  public async init() {
    const self = this;
    this.online = !(await this.networkStatus.isOffline());
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
      }
    });
  }
}
