import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { ConflictListener } from "./strategies/ConflictListener";
import { ConflictResolutionStrategy } from "./strategies/ConflictResolutionStrategy";
import { ConflictHandler, HandlerOptions } from "./ConflictHandler";

export class ConflictHandlerVersioned implements ConflictHandler {
  public conflicted: boolean;
  public clientDiff: any = {};
  public serverDiff: any = {};
  public options: HandlerOptions;

  constructor(options: HandlerOptions) {
    this.options = options;
    this.conflicted = false;
    this.checkConflict(this.options.base, this.options.client, this.options.server);
  }

  public checkConflict(base: ConflictResolutionData, client: ConflictResolutionData, server: ConflictResolutionData) {
    for (const key of Object.keys(client)) {
      if (base[key] && base[key] !== client[key]
      && !this.options.ignoredKeys.includes(key)) {
        this.clientDiff[key] = client[key];
      }
    }
    for (const key of Object.keys(this.options.client)) {
      if (base[key] && base[key] !== server[key]
      && !this.options.ignoredKeys.includes(key)) {
        this.serverDiff[key] = server[key];
        if (this.clientDiff[key]) {
          this.conflicted = true;
        }
      }
    }
  }

  public executeStrategy(operationName: string) {
    const resolvedData = this.options.strategy(this.options.base, this.serverDiff, this.clientDiff);
    if (this.options.listener) {
      if (this.conflicted) {
        this.options.listener.conflictOccurred(operationName, resolvedData, this.options.server, this.options.client);
      } else if (this.options.listener.mergeOccurred) {
        this.options.listener.mergeOccurred(operationName, resolvedData, this.options.server, this.options.client);
      }
    }
    const filteredData: any = {};
    for (const field of resolvedData) {
      if (this.options.client[field]) {
        filteredData[field] = this.options.client[field];
      }
    }
    return filteredData;
  }
}
