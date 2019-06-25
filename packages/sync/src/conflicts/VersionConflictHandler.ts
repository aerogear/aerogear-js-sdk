import { ConflictResolutionData } from "./strategies/ConflictResolutionData";
import { ConflictListener } from "./strategies/ConflictListener";
import { ConflictResolutionStrategy } from "./strategies/ConflictResolutionStrategy";
import { ConflictHandler, HandlerOptions } from "./ConflictHandler";
import { ObjectState } from "./state/ObjectState";

export class VersionConflictHandler implements ConflictHandler {
  public conflicted: boolean;
  public clientDiff: any = {};
  public serverDiff: any = {};
  public options: HandlerOptions;
  private ignoredKeys: string[];

  constructor(options: HandlerOptions) {
    this.options = options;
    this.conflicted = false;
    this.ignoredKeys = this.options.ignoredKeys || ["version", "id"];
    this.checkConflict(this.options.base, this.options.client, this.options.server);
  }

  public checkConflict(base: ConflictResolutionData, client: ConflictResolutionData, server: ConflictResolutionData) {
    for (const key of Object.keys(client)) {
      if (base[key] && base[key] !== client[key] && !this.ignoredKeys.includes(key)) {
          this.clientDiff[key] = client[key];
        }
    }
    for (const key of Object.keys(this.options.client)) {
      if (base[key] && base[key] !== server[key] && !this.ignoredKeys.includes(key)) {
          this.serverDiff[key] = server[key];
          if (this.clientDiff[key]) {
            this.conflicted = true;
          }
        }
    }
  }

  public executeStrategy(operationName: string) {
    const resolvedData = this.options.strategy(this.options.base, this.serverDiff, this.clientDiff);
    resolvedData.version = this.options.server.version;
    if (this.options.listener) {
      if (this.conflicted) {
        this.options.listener.conflictOccurred(operationName, resolvedData, this.options.server, this.options.client);
      } else if (this.options.listener.mergeOccurred) {
        this.options.listener.mergeOccurred(operationName, resolvedData, this.options.server, this.options.client);
      }
    }
    const filteredData: any = {};
    for (const key of Object.keys(resolvedData)) {
      if (this.options.client[key]) {
        filteredData[key] = resolvedData[key];
      }
    }
    return filteredData;
  }
}
