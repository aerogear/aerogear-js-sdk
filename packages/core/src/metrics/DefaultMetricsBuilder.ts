import console from "loglevel";
import uuid from "uuid/v1";

import { isMobileCordova } from "../PlatformUtils";
import { Metrics, MetricsPayload, MetricsBuilder } from "./model";
import { CordovaAppMetrics } from "./platform/CordovaAppMetrics";
import { CordovaDeviceMetrics } from "./platform/CordovaDeviceMetrics";
declare var window: any;

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, data: string): void;
}

export class DefaultMetricsBuilder implements MetricsBuilder {

  public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";

  private storage: Storage;

  constructor(storage?: Storage) {
    this.storage = storage || window.localStorage;
  }

  /**
   * Generates or gets mobile client id
   */
  public getClientId(): string {
    let clientId = this.getSavedClientId();

    if (!clientId) {
      clientId = uuid();
      this.saveClientId(clientId);
    }

    return clientId;
  }

  public getSavedClientId(): string | null {
    return this.storage.getItem(DefaultMetricsBuilder.CLIENT_ID_KEY);
  }

  public saveClientId(id: string): void {
    this.storage.setItem(DefaultMetricsBuilder.CLIENT_ID_KEY, id);
  }

  /**
   * Builds array of default metrics objects that are sent to server on every request.
   * Other platforms can override this method to provide custom behavior
   */
  public buildDefaultMetrics(): Metrics[] {
    if (isMobileCordova()) {
      return [new CordovaAppMetrics(), new CordovaDeviceMetrics()];
    } else {
      // No support of other platforms in default implementation.
      // Please extend MetricsService class.
      console.warn("Current platform is not supported by metrics.");
      return [];
    }
  }

  /**
   * Builds the payload
   * @param type string
   * @param metrics Metrics array, typically can be new buildDefaultMetrics()
   * returns promise with metrics payload
   */
  public async buildMetricsPayload(type: string, metrics: Metrics[]): Promise<MetricsPayload> {
    const payload: MetricsPayload = {
      clientId: this.getClientId(),
      type,
      timestamp: new Date().getTime(),
      data: {}
    };

    for (const metric of metrics) {
      payload.data[metric.identifier] = await metric.collect();
    }

    return payload;
  }

}
