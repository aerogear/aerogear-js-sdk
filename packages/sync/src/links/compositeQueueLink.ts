import { OfflineQueueLink, TYPE_MUTATION } from "./OfflineQueueLink";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { DataSyncConfig } from "../config";
import { ApolloLink, Operation } from "apollo-link";
import { onError } from "apollo-link-error";
import { RetryLink } from "apollo-link-retry";

export const compositeQueueLink = (config: DataSyncConfig, filter?: TYPE_MUTATION): ApolloLink => {
  const offlineLink = new OfflineQueueLink(config, filter);
  offlineLink.openQueueOnNetworkStateUpdates();
  const errorLink = onError(({ networkError, operation }) => {
    if (networkError) {
      operation.variables.__networkError = networkError;
    }
  });
  const retryLink = new RetryLink({
    attempts: (_: number, operation: Operation): boolean | Promise<boolean> => {
      return !offlineLink.isClosed && operation.variables.__offlineQueue;
    }
  });
  const localLink = new LocalDirectiveFilterLink();
  return ApolloLink.from([offlineLink, errorLink, localLink, retryLink]);
};
