import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloCache } from "apollo-cache";

/**
 * Interface that can be used to provide custom
 * method for detecting anb handling delete operation
 */
export interface DeleteMutationHandler {
  /**
   * @returns true when operation is delete
   * Implementors can rely on number of factors like:
   * Returning specific type/scalar
   * Returning extra information in graphql operation.extensions field
   * Relying on some specific names/prefixes
   */
  isDeleteOperation(operation: Operation): boolean;

  /**
   * Method that can be used to update cache for  delete operations
   */
  updateCache(type: string, cache: ApolloCache<NormalizedCacheObject>): void;
}

export const defaultHandler: DeleteMutationHandler = {
  isDeleteOperation: (operation: Operation) => {
    return false;
  },
  updateCache: (type: string, cache: ApolloCache<NormalizedCacheObject>) => {
    cache.writeData({ id: `MyType:${id}`, data: null });
  }
};

/**
 * Handling delete operations on cache.
 * Helper link that reduces complexity of updating cache every time
 * delete operation is performed.
 * Assumptions: this link by default assumes that at all times delete
 * mutations will return single id:
 *
 * ``
 *  deleteUser(id: ID!): ID
 * ``
 * Users can modify behavior by supplying custom `DeleteMutationHandler`
 */
export class DeleteCacheHandlerLink extends ApolloLink {

  private handler: DeleteMutationHandler;
  private cache: ApolloCache<NormalizedCacheObject>;

  /**
   * @param cache apollo cache that will be operated on
   * @param handler optional custom handler
   */
  constructor(cache: ApolloCache<NormalizedCacheObject>, handler?: DeleteMutationHandler) {
    super();
    this.cache = cache;
    this.handler = handler ? handler : defaultHandler;
  }

  public request(operation: Operation, forward: NextLink): Observable<FetchResult> | null {
    if (this.handler.isDeleteOperation(operation)) {
      return forward(operation).map((data) => {
        this.handler.updateCache(this.cache);
        return data;
      });
    }
    return forward(operation);
  }
}
