import { MutationOptions, OperationVariables, MutationUpdaterFn } from "apollo-client";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./CacheOperation";
import { createOptimisticResponse } from "./createOptimisticResponse";
import { Query, QueryWithVariables } from "./CacheUpdates";
import { getOperationFieldName } from "../utils/helpers";

export interface MutationHelperOptions {
  mutation: DocumentNode;
  variables: OperationVariables;
  updateQuery: Query;
  typeName: string;
  operationType?: CacheOperation;
  idField?: string;
}

export const createMutationOptions = (options: MutationHelperOptions): MutationOptions => {
  const {
    mutation,
    variables,
    updateQuery,
    typeName,
    operationType = CacheOperation.ADD,
    idField = "id"
  } = options;
  const operationName = getOperationFieldName(mutation);
  const optimisticResponse = createOptimisticResponse(operationName,
    typeName,
    variables,
    operationType === CacheOperation.ADD);

  const update = getUpdateFunction(operationName, idField, updateQuery, operationType);
  return { mutation, variables, optimisticResponse, update };
};

// returns the update function used to update the cache by the client
// ignores the scenario where the cache operation is an update as this is handled automatically
// from Apollo client 2.5 onwards.
const getUpdateFunction = (
  operation: string,
  idField: string,
  updateQuery: Query,
  opType: CacheOperation): MutationUpdaterFn => {

  const { query, variables } = deconstructQuery(updateQuery);
  const queryField = getOperationFieldName(query);

  let updateFunction: MutationUpdaterFn;

  switch (opType) {
    case CacheOperation.ADD:
      updateFunction = (cache, { data }) => {
        try {
          if (data) {
            let queryResult = cache.readQuery({ query, variables }) as any;
            const operationData = data[operation];
            const result = queryResult[queryField];
            if (result) {
              if (!result.find((item: any) => {
                return item[idField] === operationData[idField];
              })) {
                result.push(operationData);
              }
            } else {
              queryResult = [result];
            }
            cache.writeQuery({
              query,
              variables,
              data: queryResult
            });
          }
        } catch (e) {
          throw (e);
        }
      };
      break;
    case CacheOperation.DELETE:
      updateFunction = (cache, { data }) => {
        try {
          if (data) {
            const queryResult = cache.readQuery({ query, variables }) as any;
            const operationData = data[operation];
            const newData = queryResult[queryField].filter((item: any) => {
              return operationData[idField] !== item[idField];
            });
            cache.writeQuery({
              query,
              variables,
              data: newData
            });
          }
        } catch (e) {
          throw (e);
        }
      };
      break;
    default:
      updateFunction = () => {
        return;
      };
  }
  return updateFunction;
};

// this function takes a Query and returns its constituent parts, if available.
const deconstructQuery = (updateQuery: Query): QueryWithVariables => {
  let query: DocumentNode;
  let variables: OperationVariables | undefined;
  if (isQueryWithVariables(updateQuery)) {
    query = updateQuery.query;
    variables = updateQuery.variables;
  } else {
    query = updateQuery;
  }
  return { query, variables };
};

const isQueryWithVariables = (doc: Query): doc is QueryWithVariables => {
  if ((doc as QueryWithVariables).variables) {
    return true;
  } else {
    return false;
  }
};
