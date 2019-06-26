import { ApolloLink, NextLink, Operation, Observable } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { isMutation } from "../utils/helpers";
import { getObjectFromCache } from "../offline/storage/defaultStorage";
import { ObjectState } from ".";
import { logger } from "../links/LocalDirectiveFilterLink";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";

/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 */
export class LocalConflictError extends Error {
  /**
   * Flag used to recognize this type of error
   */
  public localConflict = true;
  constructor(public base: any, public variables: any) {
    super();
  }
}

export class BaseLink extends ApolloLink {

  constructor(private stater: ObjectState, private cache: InMemoryCache) {
    super();
  }

  public request(operation: Operation, forward: NextLink) {
    if (isMutation(operation)) {
      return this.processBaseState(operation, forward);
      // Nothing to do here
    } else {
      return forward(operation);
    }
  }

  private processBaseState(operation: Operation, forward: NextLink) {
    const context = operation.getContext();
    const base = getObjectFromCache(this.cache, operation.variables.id, context.returnType);
    if (!base) {
      return this.createLocalConflict(base, operation.variables);
    }
    const currentChange = this.stater.currentState(base);
    const userState = this.stater.currentState(operation.variables);
    if (currentChange != userState) {
      // 🙊 Input data is conflicted with the latest server projection
      return this.createLocalConflict(base, operation.variables);
    }
    this.stater.currentState(base);
    return forward(operation);
  }

  /**
   * Local conflict happens when user opens view with cached data and in the mean time 
   * cache gets updated by subscriptions. In this case it makes no sense to send request to server as we know
   * that data was outdated. Developers need to handle this use case instantly
   * (instead enqueuing data for offline processing)
   */
  private createLocalConflict(base: ConflictResolutionData, variables: ConflictResolutionData) {
    return new Observable(observer => {
      logger("Returning local conflict error to client");
      observer.error(new LocalConflictError(base, variables));
      return () => { return; };
    });
  }

}
