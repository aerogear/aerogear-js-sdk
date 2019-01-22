import { getMainDefinition } from "apollo-utilities";
import { Operation } from "apollo-link";
import { OperationDefinitionNode, DocumentNode } from "graphql";

export const isSubscription = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "subscription";
};

export const getMutationName = (mutation: DocumentNode) => {
  const definition = mutation.definitions.find(def => def.kind === "OperationDefinition");
  const operationDefinition = definition && definition as OperationDefinitionNode;
  return operationDefinition && operationDefinition.name && operationDefinition.name.value;
};
