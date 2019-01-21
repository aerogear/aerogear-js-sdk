import ApolloClient, { OperationVariables, MutationOptions, ApolloClientOptions } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { FetchResult } from "apollo-link";
import ProxyUpdate from "./ProxyUpdate";
import { OperationDefinitionNode } from "graphql";

export class VoyagerClient extends ApolloClient<NormalizedCacheObject> {
  private readonly proxyUpdate?: ProxyUpdate;

  constructor(options: ApolloClientOptions<NormalizedCacheObject>, proxyUpdate?: ProxyUpdate) {
    super(options);

    this.proxyUpdate = proxyUpdate;
  }

  public mutate<T, TVariables = OperationVariables>(options: MutationOptions<T, TVariables>): Promise<FetchResult<T>> {
    if (this.proxyUpdate && options.update === undefined) {
      const definition = options.mutation.definitions.find(def => def.kind === "OperationDefinition");
      const operationDefinition = definition && definition as OperationDefinitionNode;
      const operationName = operationDefinition && operationDefinition.name && operationDefinition.name.value;

      if (operationName) {
        options.update = this.proxyUpdate(operationName);
      }
    }
    return super.mutate(options);
  }
}
