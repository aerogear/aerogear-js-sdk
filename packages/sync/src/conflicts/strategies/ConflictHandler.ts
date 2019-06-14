import { ConflictResolutionData } from "./ConflictResolutionData";
import { ConflictListener } from "./ConflictListener";
import { ConflictResolutionStrategy } from "./ConflictResolutionStrategy";

export class ConflictHandler {
public conflicted: boolean;
private clientDiff: any = {};
private serverDiff: any = {};
  constructor(private base: ConflictResolutionData,
              private client: ConflictResolutionData,
              private server: ConflictResolutionData,
              private strategy: ConflictResolutionStrategy,
              private listener?: ConflictListener) {
                this.conflicted = false;
                this.checkConflict();
  }

  public checkConflict() {
    for (const key of Object.keys(this.client)) {
      if (this.base[key] && this.base[key] !== this.client[key] && key !== "version" && key !== "id") {
        this.clientDiff[key] = this.client[key];
      }
    }
    for (const key of Object.keys(this.client)) {
      if (this.base[key] && this.base[key] !== this.server[key] && key !== "version" && key !== "id") {
        this.serverDiff[key] = this.server[key];
        if (this.clientDiff[key]) {
          this.conflicted = true;
        }
      }
    }
  }

  public executeStrategy(operationName: string) {
    const resolvedData = this.strategy(this.base, this.serverDiff, this.clientDiff);
    if (this.listener) {
      if (this.conflicted) {
        this.listener.conflictOccurred(operationName, resolvedData, this.server, this.client);
      } else if (this.listener.mergeOccurred) {
        this.listener.mergeOccurred(operationName, resolvedData, this.server, this.client);
      }
    }
    const filteredData: any = {};
    for (const field of resolvedData) {
      if (this.client[field]) {
        filteredData[field] = this.client[field];
      }
    }
    return filteredData;
  }
}
