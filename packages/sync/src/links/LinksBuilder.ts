import { ApolloLink, split } from "apollo-link";
import { HttpLink } from "apollo-link-http";
import { conflictLink } from "../conflicts/conflictLink";
import { DataSyncConfig } from "../config/DataSyncConfig";
import { defaultWebSocketLink } from "./WebsocketLink";
import { OfflineQueueLink } from "./OfflineQueueLink";
import { isSubscription } from "../utils/helpers";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { DeleteCacheHandlerLink } from "./DeleteCacheLink";
import { ApolloCache } from "apollo-cache";

/**
 * Function used to build Apollo link
 */
export type LinkChainBuilder = (config: DataSyncConfig,
                                cache: ApolloCache<NormalizedCacheObject>) => ApolloLink;

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
  (config: DataSyncConfig, cache: ApolloCache<NormalizedCacheObject>): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config, cache);
    }
    const httpLink = new HttpLink({ uri: config.httpUrl });
    const queueMutationsLink = new OfflineQueueLink(config, "mutation");
    // Enable network based queuing
    queueMutationsLink.openQueueOnNetworkStateUpdates();

    const links: ApolloLink[] = [queueMutationsLink];

    if (config.conflictStrategy) {
      links.push(conflictLink(config));
    }
    const deleteCacheLink = new DeleteCacheHandlerLink(cache);
    links.push(deleteCacheLink);
    links.push(httpLink);

    let compositeLink = ApolloLink.from(links);
    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(isSubscription, wsLink, compositeLink);
    }
    return compositeLink;
  };
