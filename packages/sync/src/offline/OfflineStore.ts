import { PersistentStore, PersistedData } from "../PersistentStore";
import { DataSyncConfig } from "..";
import { OperationQueueEntry, OfflineItem } from "./OperationQueueEntry";

/**
 * Abstract Offline storage
 */
export class OfflineStore {

  private storage: PersistentStore<PersistedData>;
  private offlineMetaKey: string = "offline-meta-data";
  private arrayOfKeys: string[];

  constructor(clientConfig: DataSyncConfig) {
    this.storage = clientConfig.storage as PersistentStore<PersistedData>;
    this.arrayOfKeys = [];
  }

  /**
   * Save an entry to store
   *
   * @param entry - the entry to be saved
   */
  public async saveEntry(entry: OperationQueueEntry) {
    this.arrayOfKeys.push(entry.id);
    await this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    await this.storage.setItem(this.generateOfflineKey(entry), entry.toOfflineItem());
  }

  /**
   * Remove an entry from the store
   *
   * @param queue - the entry to be removed
   */
  public async removeEntry(entry: OperationQueueEntry) {
    const index = this.arrayOfKeys.indexOf(entry.id);
    this.arrayOfKeys.splice(index, 1);
    this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    const offlineKey = this.generateOfflineKey(entry);
    await this.storage.removeItem(offlineKey);
  }

  /**
   * Fetch data from the
   */
  public async getOfflineData(): Promise<OfflineItem[]> {
    const keys = await this.storage.getItem(this.offlineMetaKey);
    const offlineItems: OfflineItem[] = [];
    if (keys) {
      this.arrayOfKeys = keys as string[];
      for (const key of this.arrayOfKeys) {
        const item = await this.storage.getItem("offline:" + key.toString());
        if (typeof item === "string") {
          offlineItems.push(JSON.parse(item));
        } else {
          if (item) {
            offlineItems.push(item as OfflineItem);
          }
        }
      }
    }
    return offlineItems;
  }

  private generateOfflineKey(entry: OperationQueueEntry): string {
    return "offline:" + entry.id;
  }
}
