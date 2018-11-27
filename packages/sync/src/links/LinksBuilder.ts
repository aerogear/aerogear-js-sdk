import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts/conflictLink";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";
import QueueLink from "./QueueLink";
import { isSubscription } from "../utils/helpers";
import ApolloClient from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";

/**
 * Function used to build Apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig, oldClient?: ApolloClient<NormalizedCacheObject>) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for:
 *
 * - Subscription handling
 * - Offline/Online queue
 * - Conflict resolution
 * - Error handling
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: DataSyncConfig, oldClient?: ApolloClient<NormalizedCacheObject>): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config, oldClient);
    }
    const httpLink = new HttpLink({ uri: config.httpUrl });
    const queueMutationsLink = new QueueLink(config, oldClient);
    let links: ApolloLink[] = [queueMutationsLink, conflictLink(config), httpLink];

    if (!config.conflictStrategy) {
      links = [queueMutationsLink, httpLink];
    }

    let compositeLink = ApolloLink.from(links);
    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(isSubscription, wsLink, compositeLink);
    }
    return compositeLink;
  };
