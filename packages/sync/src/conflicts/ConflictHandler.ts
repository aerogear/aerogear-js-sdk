import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { ConflictResolutionStrategy, ConflictListener } from ".";

export interface ConflictHandler {
  conflicted: boolean;
  clientDiff: any;
  serverDiff: any;
  options: HandlerOptions;
  executeStrategy(operationName: string): any;
  checkConflict(base: ConflictResolutionData, client: ConflictResolutionData, server: ConflictResolutionData): void;
}

export interface HandlerOptions {
  base: ConflictResolutionData;
  client: ConflictResolutionData;
  server: ConflictResolutionData;
  strategy: ConflictResolutionStrategy;
  listener?: ConflictListener;
  ignoredKeys: string[];
}
