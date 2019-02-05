import { ApolloLink, concat, Operation } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts";
import { DataSyncConfig } from "../config";
import { createHeadersLink } from "./HeadersLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { MetricsBuilder } from "@aerogear/core";
import { LocalDirectiveFilterLink } from "./LocalDirectiveFilterLink";
import { SerialLink } from "./SerialLink";
import { NetworkStatusLink } from "./NetworkStatusLink";
import { isMutation, isOnlineOnly, isSubscription } from "../utils/helpers";
import { defaultWebSocketLink } from "./WebsocketLink";

export const defaultLink = async (config: DataSyncConfig) => {
  let link = await defaultHttpLinks(config);
  if (config.wsUrl) {
    const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
    link = ApolloLink.split(isSubscription, wsLink, link);
  }
  return link;
};

/**
 * Default HTTP Apollo Links
 * Provides out of the box functionality for:
 *
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 * - Audit logging
 */
export const defaultHttpLinks = async (config: DataSyncConfig): Promise<ApolloLink> => {
  let links: ApolloLink[] = [];
  if (config.networkStatus) {
    const serialLink = new SerialLink({
      storage: config.storage,
      storageKey: config.mutationsQueueName,
      squashOperations: config.mergeOfflineMutations,
      listener: config.offlineQueueListener
    });
    const networkStatusLink = new NetworkStatusLink(config.networkStatus);
    const localDirectiveFilterLink = new LocalDirectiveFilterLink();
    let offlineLink = ApolloLink.from([serialLink, networkStatusLink, localDirectiveFilterLink]);

    offlineLink = ApolloLink.split((op: Operation) => isMutation(op) && !isOnlineOnly(op), offlineLink);
    links = [offlineLink];
  }

  let httpLink = new HttpLink({ uri: config.httpUrl, includeExtensions: config.auditLogging }) as ApolloLink;
  if (config.headerProvider) {
    httpLink = concat(createHeadersLink(config), httpLink);
  }

  if (config.conflictStrategy) {
    links = [...links, conflictLink(config), httpLink];
  } else {
    links = [...links, httpLink];
  }

  if (config.auditLogging) {
    const auditLoggingLink = await createAuditLoggingLink(config);
    links.unshift(auditLoggingLink);
  }

  return ApolloLink.from(links);
};

export const createAuditLoggingLink = async (config: DataSyncConfig): Promise<AuditLoggingLink> => {
  const metricsBuilder: MetricsBuilder = new MetricsBuilder();
  const metricsPayload: {
    [key: string]: any;
  } = {};
  const metrics = metricsBuilder.buildDefaultMetrics();
  for (const metric of metrics) {
    metricsPayload[metric.identifier] = await metric.collect();
  }
  return new AuditLoggingLink(metricsBuilder.getClientId(), metricsPayload);
};
