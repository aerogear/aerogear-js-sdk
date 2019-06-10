import { ConflictResolutionData } from "./ConflictResolutionData";

/**
 * Interface for strategy that can be used to resolve conflict
 *
 * @param base - base data before both changes were applied
 * @param server - server data
 * @param client - client data
 */
export type ConflictResolutionStrategy =
  (base: ConflictResolutionData,
   server: ConflictResolutionData,
   client: ConflictResolutionData) => ConflictResolutionData;

/**
 * Interface for conflict handlers that can be used to resolve conflicts.
 * It is modeled as a Dictionary where the key is the operation name and the value is the conflict resolver function.
 */
// FIXME - this looks bad. Maybe we can use registration same as queue listener
export interface ConflictResolutionStrategies {
  default?: ConflictResolutionStrategy;
  strategies?: {
    [operationName: string]: ConflictResolutionStrategy
  };
}
