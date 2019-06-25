import { ApolloLink, NextLink, Operation } from "apollo-link";
import { InMemoryCache } from "apollo-cache-inmemory";
import { isMutation } from "../utils/helpers";
import { getObjectFromCache } from "../offline/storage/defaultStorage";

export class BaseLink extends ApolloLink {

  constructor(private cache: InMemoryCache) {
    super();
  }

  public request(operation: Operation, forward: NextLink) {
    if (!isMutation(operation)) {
      // Nothing to do here
      return forward(operation);
    } else {
      // TODO disable when no strategy applied
      const context = operation.getContext();
      const base = getObjectFromCache(this.cache, operation.variables.id, context.returnType);
      if (base && Object.keys(base).length !== 0) {
        operation.setContext({ base });
      }
      return forward(operation);
    }
  }
}
