import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy, ConflictResolutionStrategies } from "./ConflictResolutionStrategy";

/**
 * Listener that allows users to track conflict information
 */
export interface ConflictListener {
/**
 * @param operationName - operation name for mutation that being processed.
 * For example getUsers
 * @param resolvedData - data that was sent back to server
 * @param server - server data
 * @param client - client data
 */
  conflictOccurred(operationName: string,
                   resolvedData: ConflictResolutionData,
                   server: ConflictResolutionData,
                   client: ConflictResolutionData
  ): void;

  mergeOccurred?(operationName: string,
                 resolvedData: ConflictResolutionData,
                 server: ConflictResolutionData,
                 client: ConflictResolutionData
  ): void;

}
