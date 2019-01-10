import { ApolloLink, Operation, NextLink } from "apollo-link";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { GraphQLError } from "graphql";
import { ConflictResolutionData } from "./ConflictResolutionData";

export class OfflineLink extends ApolloLink {

  constructor(private config: DataSyncConfig) {
    super();
  }

  public request(operation: Operation, forward: NextLink) {
    return forward(operation).map(({ data, errors }) => {
      const response = data;
      // data from a previous link
      const conflictData = this.getConflictData(errors);
      if (conflictData && this.config.conflictStrategy && this.config.conflictStateProvider) {
        let resolvedConflict;
        if (conflictData.resolvedOnServer) {
          resolvedConflict = conflictData.serverState;
          if (response) {
            // Set data to resolved state
            response.data = resolvedConflict;
            // 🍴 eat error
            response.errors = undefined;
          }
          if (this.config.conflictListener) {
            this.config.conflictListener.conflictOccurred(operation.operationName,
              resolvedConflict, conflictData.serverState, conflictData.clientState);
          }
        } else {
          // resolve on client
          resolvedConflict = this.config.conflictStrategy(operation.operationName,
            conflictData.serverState, conflictData.clientState);
          if (this.config.conflictListener) {
            this.config.conflictListener.conflictOccurred(operation.operationName,
              resolvedConflict, conflictData.serverState, conflictData.clientState);
          }
          operation.variables = this.config.conflictStateProvider.nextState(resolvedConflict);
          if (response) {
            // 🍴 eat error
            response.errors = undefined;
          }
          return forward(operation);
        }
      }
      return data;
    });
  }

  public getConflictData(graphQLErrors?: ReadonlyArray<GraphQLError>): ConflictResolutionData {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        if (err.extensions) {
          // TODO need to add flag to check if conflict was resolved on the server
          if (err.extensions.exception.conflictInfo) {
            return err.extensions.exception.conflictInfo;
          }
        }
      }
    }
  }
}

