
/***
 * TODO docs
 */
export interface BaseStateProvider {
    save(base: any, key: string, persist: boolean): Promise<void>;
    read(key: string): any;
    delete(key: string): void;
    restore(): Promise<void>;
}