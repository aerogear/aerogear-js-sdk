import { MutationUpdaterFn } from "apollo-client";

type ProxyUpdate = (mutationName: string) => MutationUpdaterFn;

export default ProxyUpdate;
