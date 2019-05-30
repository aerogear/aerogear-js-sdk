import { BaseStateProvider } from "./BaseStateProvider";

/**
 * TODO
 */
export class BaseStateStore implements BaseStateProvider {
    public baseState: any = {};

    save(base: any, key: string, persist: boolean): Promise<void> {
        this.baseState[key] = base;
        // TODO persist
        return Promise.resolve();
    }

    read(key: string): Promise<any> {
        return this.baseState[key];
    }

    delete(key: string): void {
       delete this.baseState[key];
    }
}