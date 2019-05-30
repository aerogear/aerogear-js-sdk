
import { ApolloLink, NextLink, Operation } from "apollo-link";
import { BaseStateProvider } from "./BaseStateProvider";

export class BaseStateLink extends ApolloLink {

  constructor(private baseState: BaseStateProvider) {
    super();
  }

  public request(operation: Operation, forward?: NextLink) {
    // TODO
    if (!forward) {
      return null;
    }
    return forward(operation);
  }
}
