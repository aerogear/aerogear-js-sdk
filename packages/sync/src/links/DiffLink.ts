import { ApolloLink, NextLink, Operation } from "apollo-link";
import ApolloClient from "apollo-client";
import { NormalizedCacheObject, InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";

export interface DiffableOperationVariables {
  id: string;
  version: number;
  [key: string]: any;
}

export class DiffLink extends ApolloLink {

  constructor(private cache: InMemoryCache) {
    super();
  }

  public request(operation: Operation, forward?: NextLink) {
    const diffableOperation = operation.variables as DiffableOperationVariables;
    const topLevelId = diffableOperation.id;
    const topLevelVersion = diffableOperation.version;
    // const cachedObject = wojciechsMethod();
    const fragment = gql`
          fragment cacheTask on Task {
            title
            description
            status
          }
        `;
    const id = `Task:${operation.variables.id}`;
    const cachedObject = this.cache.readFragment({ fragment, id }, false) as any;
    const newVars: any = {};
    if (cachedObject) {
      for (const key in cachedObject) {
        if (diffableOperation[key] !== undefined && (cachedObject[key] !== diffableOperation[key])) {
          newVars[key] = diffableOperation[key];
        }
      }
      operation.variables = { ...newVars, id: topLevelId, version: topLevelVersion };
    }
    if (!forward) {
      return null;
    }
    return forward(operation);
  }
}
