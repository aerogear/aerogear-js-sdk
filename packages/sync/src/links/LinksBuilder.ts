import {ApolloLink, concat, split} from "apollo-link";
import {HttpLink} from "apollo-link-http";
import {getMainDefinition} from "apollo-utilities";
import {IDataSyncConfig} from "..";
import {defaultWebSocketLink} from "./WebsocketLink";

/**
 * Function used to build apollo link
 */
export type LinkChainBuilder = (config: IDataSyncConfig) => ApolloLink;

/**
 * Default Apollo Link builder
 * Provides out of the box functionality for the users
 */
export const defaultLinkBuilder: LinkChainBuilder =
  (config: IDataSyncConfig): ApolloLink => {
    if (config.customLinkBuilder) {
      return config.customLinkBuilder(config);
    }

    const httpLink = new HttpLink({ uri: config.httpUrl });
    const authMiddleware = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          Accept: "application/json",
          Authorization: "Bearer 8abfae4eb02a6140c0a20798433180a063fd7006"
        }
      });

      return forward(operation);
    });

    // TODO drop your links here
    let compositeLink = ApolloLink.from([concat(authMiddleware, httpLink)]);

    if (config.wsUrl) {
      const wsLink = defaultWebSocketLink({ uri: config.wsUrl });
      compositeLink = split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query) as any;
          return kind === "OperationDefinition" && operation === "subscription";
        },
        wsLink,
        compositeLink
      );
    }
    return compositeLink;
  };
