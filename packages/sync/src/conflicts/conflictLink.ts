import { onError, ErrorResponse } from "apollo-link-error";
import { GraphQLError } from "graphql";
import { DataSyncConfig } from "../config";
import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { InMemoryCache } from "apollo-cache-inmemory";
import { getObjectFromCache } from "../offline/storage/defaultStorage";
import { isMutation } from "../utils/helpers";
import { BaseStateProvider } from "./base/BaseStateProvider";
import { ObjectState, ConflictListener, ConflictResolutionStrategies } from ".";


/**
 * Local conflict thrown when data outdates even before sending it to the server.
 * Can be used to correct any data in flight or shown user another UI to visualize new state
 */
export class LocalConflictError extends Error {
  constructor(private base: any, private variables: any) {
    super();
  }
}

/**
 * Represents conflict information that was returned from server
 */
export interface ConflictInfo {
  serverState: ConflictResolutionData
  clientState: ConflictResolutionData
  // Expected return type of the mutation
  returnType: string
}

/**
 * Configuration for conflict resolution
 */
export interface ConflictConfig {
  /**
   * Interface that defines how object state is progressed
   * This interface needs to match state provider supplied on server.
   */
  conflictProvider: ObjectState;

  /**
   * Interface that can be implemented to receive information about the data conflict
   *
   * @deprecated see OfflineClient.registerOfflineEventListener
   */
  conflictListener?: ConflictListener;

  /**
   * The conflict resolution strategy your client should use. By default it takes client version.
   */
  conflictStrategy?: ConflictResolutionStrategies;

  /**
   * Base state provider gives ability to save base state
   */
  baseState: BaseStateProvider
}

/**
 * Conflict handling link implementation that provides ability to determine 
 */
export class ConflictLink extends ApolloLink {
  private link: ApolloLink;
  private stater: ObjectState;
  private strategy: ConflictResolutionStrategies | undefined;
  private listener: ConflictListener | undefined;

  constructor(private config: ConflictConfig, private cache: InMemoryCache) {
    super();
    this.link = onError((errorResponse) => {
      this.conflictErrorHandler(errorResponse);
    });
    this.stater = this.config.conflictProvider;
    this.strategy = this.config.conflictStrategy;
    this.listener = this.config.conflictListener;
  }

  public request(
    operation: Operation,
    forward: NextLink,
  ): Observable<FetchResult> | null {
    if (!isMutation(operation)) {
      // 🙈 Nothing to do here 
      return forward(operation);
    }
    const currentState = this.stater.currentState(operation.variables);
    if (!currentState) {
      // 🙈 Missing state information in request.
      // No action here
      return forward(operation);
    }
    this.processBaseState(operation, forward);
    // FIXME removing base state
    return this.link.request(operation, forward);
  }

  private processBaseState(operation: Operation, forward: NextLink) {
    const context = operation.getContext();
    const base = getObjectFromCache(this.cache, operation.variables.id, context.returnType);
    if (base && Object.keys(base).length != 0) {
      const currentChange = this.stater.currentState(base);
      const userState = this.stater.currentState(operation.variables);
      if (currentChange !== userState) {
         // 🙊 Input data is conflicted with the latest server projection
        throw new LocalConflictError(base, operation.variables);
      }
      // FIME operation.toKey uniquenes
      this.config.baseState.save(base, operation.toKey(), false);
    }
  }

  private conflictErrorHandler(errorResponse: ErrorResponse) {
    const { response, operation, forward, graphQLErrors } = errorResponse;
    const data = this.getConflictData(graphQLErrors);
    if (data && this.strategy) {
      let resolvedConflict;
      // FIXME Improve key (hasing toKey or something else)
      const base = this.config.baseState.read(operation.toKey());
      // FIXME bad api
      if (this.strategy.strategies &&
        !!this.strategy.strategies[operation.operationName]) {
        const individualStrategy = this.strategy.strategies[operation.operationName];
        resolvedConflict = individualStrategy(base, data.serverState, data.clientState);
      } else if (this.strategy.default) {
        resolvedConflict = this.strategy.default(base, data.serverState, data.clientState);
      }
      // FIXME Do not notify when conflict was resolved without issues
      if (this.listener) {
        this.listener.conflictOccurred(operation.operationName,
          resolvedConflict, data.serverState, data.clientState);
      }
      operation.variables = this.stater.nextState(resolvedConflict);
      if (response) {
        // 🍴 eat error
        response.errors = undefined;
      }
      // FIXME at this point offline operation is removed from queue
      // If forward fails data will be lost!
      return forward(operation);
    }
  }

  /**
  * Fetch conflict data from the errors returned from the server
  * @param graphQLErrors array of errors to retrieve conflicted data from
  */
  private getConflictData(graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictInfo | undefined {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions) {
          if (err.extensions.exception.conflictInfo) {
            return err.extensions.exception.conflictInfo;
          }
        }
      }
    }
  }


}

