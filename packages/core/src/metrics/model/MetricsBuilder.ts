import { Metrics } from "./Metrics";
import { MetricsPayload } from "./MetricsPayload";

export interface MetricsBuilder {
  /**
   * Generates or gets mobile client id
   */
  getClientId(): string;

  /**
   * Getter for getting the client id from storage
   */
  getSavedClientId(): string | null;
  /**
   * Setter for saving the client id to storage
   * @param id string typically UUID
   */
  saveClientId(id: string): void;

  /**
   * Builds array of default metrics objects that are sent to server on every request.
   * Other platforms can override this method to provide custom behavior
   */
  buildDefaultMetrics(): Metrics[];

  /**
   * Builds the metrics payload
   * @param type string
   * @param metrics Metrics array
   * returns promise with metrics payload
   */
  buildMetricsPayload(type: string, metrics: Metrics[]): Promise<MetricsPayload>;
}
