
/**
 * Interface for underlying storage solutions
 */
export interface PersistentStore<T> {
  getItem: (key: string) => Promise<T>;
  setItem: (key: string, data: T) => any;
  removeItem: (key: string) => Promise<void>;
}

export type PersistedData = string | null | object;
