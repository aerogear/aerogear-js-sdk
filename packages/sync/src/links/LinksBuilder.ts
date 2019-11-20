import { ApolloLink } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { DataSyncConfig } from "../config";
import { createAuthLink } from "./AuthLink";
import { AuditLoggingLink } from "./AuditLoggingLink";
import { createUploadLink } from "apollo-upload-client";
import { isSubscription } from "offix-client";
import { defaultWebSocketLink } from "./WebsocketLink";

/**
 * Method for creating "uber" composite Apollo Link implementation including:
 *
 * - Http support
 * - Websocket support
 * - Offline handling
 * - Conflict resolution
 * - Audit logging
 * - File uploads
 */
export const createDefaultLink = async (
  config: DataSyncConfig
) => {
  let link = await defaultHttpLinks(config);
  if (config.wsUrl) {
    const wsLink = defaultWebSocketLink(config, { uri: config.wsUrl });
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
export const defaultHttpLinks = async (
  config: DataSyncConfig
): Promise<ApolloLink> => {
  const links: ApolloLink[] = [];

  if (config.authContextProvider) {
    links.push(createAuthLink(config));
  }

  if (config.fileUpload) {
    links.push(
      createUploadLink({
        uri: config.httpUrl,
        includeExtensions: config.auditLogging
      })
    );
  } else {
    const httpLink = new HttpLink({
      uri: config.httpUrl,
      includeExtensions: config.auditLogging
    }) as ApolloLink;
    links.push(httpLink);
  }

  return ApolloLink.from(links);
};
