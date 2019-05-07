import { MutationOptions, OperationVariables } from "apollo-client";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./CacheOperation";
import { createOptimisticResponse } from "./createOptimisticResponse";
import { type } from "os";

export interface VariablesInfo<T = OperationVariables> {
    inputType: DocumentNode;
    variables: T;
}

/**
* @param operation operation that is being performed (update)
* @param typeName type that is going to be returned
* @param idField name of id field (default:id)
*/

export const buildMutation = <T = OperationVariables>(
  mutation: DocumentNode,
  variables: VariablesInfo<T> | T,
  operation: string,
  typeName: string,
  operationType: CacheOperation = CacheOperation.ADD,
  idField: string = "id"): MutationOptions => {

  const optimisticResponse = createOptimisticResponse(operation,
    typeName,
    variables,
    operationType === CacheOperation.ADD);

  let update;
  if (operationType === CacheOperation.ADD) {
    update = buildAddOperation(operation, typeName, idField);
  }

  if (operationType === CacheOperation.DELETE) {
    update = buildDeleteOperation(operation, typeName, idField);
  }

  return { mutation, variables, optimisticResponse, update };
};

export const buildAddOperation = (typeName: string, operation: string, idField: string) => {

  return (update: any) => {
    return update;
  };
};

export const buildDeleteOperation = (typeName: string, operation: string, idField: string) => {

  return (update: any) => {
    return update;
  };
};
