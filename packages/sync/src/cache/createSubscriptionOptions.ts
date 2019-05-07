import { SubscribeToMoreOptions } from "apollo-client";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./CacheOperation";
import { getOperationFieldName } from "..";

export const createSubscriptionOptions = (
  subscriptionQuery: DocumentNode,
  cacheUpdateQuery: DocumentNode,
  operationType: CacheOperation,
  idField?: string
): SubscribeToMoreOptions => {
  const document = subscriptionQuery;

  const query = cacheUpdateQuery;
  const queryField = getOperationFieldName(query);

  return {
    document,
    updateQuery: (prev: any, { subscriptionData: { data } }) => {
      const [key] = Object.keys(data);
      const mutadedItem = data[key];

      const optype = operationType;
      const obj = prev[queryField];

      const updater = getUpdateFunction(optype, idField);
      const result = updater(obj, mutadedItem);
      return {
        [queryField]: result
      };

    }
  };
};

type UpdateFunction = (array: [CacheItem], newItem?: CacheItem) => CacheItem[];
interface CacheItem {
  [key: string]: any;
}

export const getUpdateFunction = (opType: CacheOperation, idField = "id"): UpdateFunction => {
  let updateFunction: UpdateFunction;

  switch (opType) {
    case CacheOperation.ADD:
      updateFunction = (prev, newItem) => {
        return !newItem ? [...prev] : [...prev.filter(item => {
          return item[idField] !== newItem[idField];
        }), newItem];
      };
      break;
    case CacheOperation.UPDATE:
      updateFunction = (prev, newItem) => {
        return !newItem ? [...prev] : prev.map((item: any) => item[idField] === newItem[idField] ? newItem : item);
      };
      break;
    case CacheOperation.DELETE:
      updateFunction = (prev, newItem) => {
        return !newItem ? [] : prev.filter((item: any) => item[idField] !== newItem[idField]);
      };
      break;
    default:
      updateFunction = prev => prev;
  }

  return updateFunction;
};
