
import { ApolloLink, NextLink, Operation } from "apollo-link";
import { BaseStateProvider } from "./BaseStateProvider";

/**
 * Apollo link used to manage state of the objects before 
 * they are sent to server. ObjectStates are used in conflicts to determine 
 * difference between server and client data.
 *
 * @see BaseStateProvider for more information
 */
export class BaseStateLink extends ApolloLink {

  constructor(private baseState: BaseStateProvider) {
    super();
  }

  public request(operation: Operation, forward?: NextLink) {
    // TODO get data from cache
    // TODO filter only for mutations (EDITS)
    // TODO Add persistence depending if offline or not
    this.baseState.save({}, operation.toKey(), false);
    if (!forward) {
      return null;
    }
    return forward(operation).map((data) => {
      this.baseState.delete(operation.toKey(), false);
      return data;
    })
  }
}
