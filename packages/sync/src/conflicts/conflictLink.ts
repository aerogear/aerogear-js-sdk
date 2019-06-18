import { onError, ErrorResponse } from "apollo-link-error";
import { GraphQLError } from "graphql";
import { DataSyncConfig } from "../config";
import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { getObjectFromCache } from "../offline/storage/defaultStorage";
import { isMutation } from "../utils/helpers";
import { BaseStateProvider } from "./base/BaseStateProvider";
import { ObjectState, ConflictListener, ConflictResolutionStrategies } from ".";
import { ConflictHandlerVersioned as ConflictHandler } from "./ConflictHandlerVersioned";

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
  serverState: ConflictResolutionData;
  clientState: ConflictResolutionData;
  // Expected return type of the mutation
  returnType: string;
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
  baseState: BaseStateProvider;
}

/**
 * Conflict handling link implementation that provides ability to determine
 */
export class ConflictLink extends ApolloLink {
  private link: ApolloLink;
  private stater: ObjectState;
  private strategy: ConflictResolutionStrategies | undefined;
  private listener: ConflictListener | undefined;

  constructor(private config: ConflictConfig) {
    super();
    this.link = onError((errorResponse) => {
      this.conflictHandler(errorResponse);
    });
    this.stater = this.config.conflictProvider;
    this.strategy = this.config.conflictStrategy;
    this.listener = this.config.conflictListener;
  }

  public request(
    operation: Operation,
    forward: NextLink
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
    // FIXME removing base state
    return this.link.request(operation, forward);
  }

  private conflictHandler(errorResponse: ErrorResponse) {
    const { response, operation, forward, graphQLErrors } = errorResponse;
    const data = this.getConflictData(graphQLErrors);
    if (data && this.strategy && operation.getContext().returnType) {
      let resolvedConflict;
      // FIXME Improve key (hasing toKey or something else)
      const base = operation.getContext().base;
      const individualStrategy = operation.getContext().strategy || this.strategy.default;
      // TODO do not hardcode this
      const ignoredKeys: string[] = ["version", "id"];
      const conflictHandler = new ConflictHandler({
        base,
        client: data.clientState,
        server: data.serverState,
        strategy: individualStrategy,
        listener: this.listener,
        ignoredKeys
      });
      resolvedConflict = conflictHandler.executeStrategy(operation.operationName);
      if (!conflictHandler.conflicted) {
        operation.variables = this.stater.nextState(resolvedConflict);
        if (response) {
          // 🍴 eat error
          response.errors = undefined;
        }

        return forward(operation);
      }
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
