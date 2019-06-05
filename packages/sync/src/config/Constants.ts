/**
 * Client side defined directives
 */
export enum localDirectives {
  ONLINE_ONLY = "onlineOnly",
  CONFLICT_DETECTION = "conflictDetection"
}

export const localDirectivesArray = [ localDirectives.ONLINE_ONLY, localDirectives.CONFLICT_DETECTION ];

// Feature loggers
export const MUTATION_QUEUE_LOGGER = "AeroGearSync:OfflineMutations";
export const QUEUE_LOGGER = "AeroGearSync:Link";
