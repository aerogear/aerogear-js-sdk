import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

// Used as default strategy for SDK
export const clientWins: ConflictResolutionStrategy = {
  id: 'clientWins',
  resolve: (base: ConflictResolutionData, server: ConflictResolutionData, client: ConflictResolutionData) => {
    return Object.assign(base, server, client);
  }
};
  