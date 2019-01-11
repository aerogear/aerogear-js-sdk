import { getMainDefinition } from "apollo-utilities";
import { Operation, FetchResult } from "apollo-link";
import { OperationQueueEntry } from "../links/OfflineQueueLink";

export const isSubscription = (op: Operation) => {
  const { kind, operation } = getMainDefinition(op.query) as any;
  return kind === "OperationDefinition" && operation === "subscription";
};

export const offlineQueueUpdateIds = (
  offlineQueue: OperationQueueEntry[],
  operationEntry: OperationQueueEntry,
  result: FetchResult
) => {
  const operation = operationEntry.operation;
  const optimisticResponse = operationEntry.optimisticResponse;
  if (optimisticResponse && optimisticResponse[operation.operationName].optimisticId) {
    const optimisticId = optimisticResponse[operation.operationName].id;
    offlineQueue.forEach(({ operation: op }) => {
      if (op.variables.id === optimisticId && result.data) {
        op.variables.id = result.data[operation.operationName].id;
      }
    });
  }
};
