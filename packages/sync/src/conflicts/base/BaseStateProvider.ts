
/**
 * Represents any object in the cache before applying modification from
 * currently processed mutation.
 *ß
 * BaseState is being used in Conflict resolution to calculate
 */
export type BaseState = any;

/**
 * BaseState provider provides access to the local data before modification.
 * When executing operation in GraphQL thru mutation base will typically
 * contain data before this particular modification happened.
 *
 * Provider enables to save and retrieve base data for conflict resolution purposes.
 */
export interface BaseStateProvider {

  /**
   * Add new base to currently
   *
   * @param base - base state data
   * @param key - key under data should be persisted
   * @param persist flag used to check if data should be persisted to queue
   */
  save(base: BaseState, key: string, persist?: boolean): Promise<void>;

  /**
   * Remove element from list
   *
   * @param key - key under data should be deleted
   * @param persist flag used to check if data should be persisted to queue
   */
  delete(key: string, persist?: boolean): void;

  /**
   * Gets `BaseState` data
   *
   * @param key - key under data should be fetched
   */
  read(key: string): BaseState;

  /**
   * Restores `BaseState` data from persistence layer
   */
  restore(): Promise<void>;
}
