/**
 * Client side defined directives
 */
export enum localDirectives {
  ONLINE_ONLY = "onlineOnly",
  NO_SQUASH = "noSquash",
  PARALLEL = "parallel"
}

export const localDirectivesArray = [ localDirectives.ONLINE_ONLY, localDirectives.NO_SQUASH ];

// Feature loggers
export const MUTATION_QUEUE_LOGGER = "AeroGearSync:OfflineMutations";
