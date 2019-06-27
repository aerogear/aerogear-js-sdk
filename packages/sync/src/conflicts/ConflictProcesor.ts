import { IResultProcessor } from "../offline/processors/IResultProcessor";
import { OperationQueueEntry } from "../offline/OperationQueueEntry";
import { ObjectState } from "./state/ObjectState";
import { FetchResult } from "apollo-link";

/**
 * Manipulate state of item that is being used for conflict resolution purposes.
 * This is required for the queue items so that we do not get a conflict with ourself
 * @param entry the operation which returns the result we compare with first queue entry
 */
export class ConflictProcessor implements IResultProcessor {
    constructor(private state: ObjectState) {
    }

    public execute(queue: OperationQueueEntry[],
                   entry: OperationQueueEntry, result: FetchResult): void {
        const { operation: { operationName } } = entry;
        if (!result || !this.state) {
            return;
        }

        if (result.data && result.data[operationName]) {
            for (const { operation: op } of queue) {
                if (op.variables.id === entry.operation.variables.id
                    && op.operationName === entry.operation.operationName) {
                    const opVersion = this.state.currentState(op.variables);
                    const prevOpVersion = this.state.currentState(entry.operation.variables);
                    // FIXME why we need this check? remove it
                    if (opVersion === prevOpVersion) {
                        // FIXME bug when server has more than single change next state will not work
                        op.variables = this.state.nextState(op.variables);
                        break;
                    }
                }
            }
        }
    }
}
