import { BaseStateProvider } from "./BaseStateProvider";

/**
 * Store that provides access to base state along with local persistence.
 */
export class BaseStateStore implements BaseStateProvider {
    public baseState: any = {};

    public save(base: any, key: string, persist: boolean = true): Promise<void> {
        this.baseState[key] = base;
        // TODO persist
        return Promise.resolve();
    }

    public read(key: string): Promise<any> {
        return this.baseState[key];
    }

    public delete(key: string): void {
       delete this.baseState[key];
    }

    public restore(): Promise<void> {
       // TODO
       return Promise.resolve();
    }
}