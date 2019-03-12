
import { MutationUpdaterFn } from "apollo-client";

/**
 * Interface map mutation names to their respective update functions.
 */
interface ProxyUpdate {
  [key: string]: MutationUpdaterFn;
}

export default ProxyUpdate;
