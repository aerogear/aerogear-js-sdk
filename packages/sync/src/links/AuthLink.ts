import { ApolloLink } from "apollo-link";
import { setContext } from "apollo-link-context";
import { DataSyncConfig } from "../config/DataSyncConfig";

export const createAuthLink = (config: DataSyncConfig): ApolloLink => {
  const asyncHeadersLink = setContext(async (operation, previousContext) => {
    if (config.authContextProvider) {
      const { headers } = await config.authContextProvider();
      return {
        headers
      };
    }
  });
  return asyncHeadersLink;
};
