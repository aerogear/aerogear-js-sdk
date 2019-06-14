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
