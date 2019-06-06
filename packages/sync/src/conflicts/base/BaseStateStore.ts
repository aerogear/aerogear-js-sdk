import { BaseStateProvider } from "./BaseStateProvider";
import { InMemoryCache } from "apollo-cache-inmemory";
import { Store } from "idb-localstorage";

/**
 * Store that provides access to base state along with local persistence.
 */
export class BaseStateStore implements BaseStateProvider {
  public baseState: any = {};
  private storage: Store;

  constructor() {
      this.storage = new Store("base-store", "base-data");
  }

  public save(base: any, key: string, persist: boolean = true): Promise<void> {
    this.baseState[key] = base;
    if (persist) {
      this.storage.setItem(key, base);
    }
    return Promise.resolve();
  }

  public read(key: string): Promise<any> {
    return this.baseState[key];
  }

  public async delete(key: string, persist: boolean = true) {
    delete this.baseState[key];
    if (persist) {
      await this.storage.removeItem(key);
    }
  }

  public async restore() {
    const keys = await this.storage.keys() as any;
    for (const key of keys) {
      this.baseState[key] = keys[key];
    }
  }
}
