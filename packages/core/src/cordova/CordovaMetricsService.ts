import Promise from "bluebird";
import {MetricsService} from "../metrics/MetricsService";
declare var cordova: any;

const MOBILE_CORE_CLASS = "MobileCore";

/**
 * Represents a Metrics object
 * @private
 * @example
 * var appMetrics = new MetricsImpl("app", { platform: "android" });
 */
class MetricsImpl {

  public identifier: string;
  public data: any;
  /**
   * Create a Metrics object.
   * @param {string} id - A name identifying the kind of metrics.
   * @param {object} data - An object containing all metrics and its values.
   */
  constructor(id: string, data: any) {
    this.identifier = id;
    this.data = data;
  }

  /**
   * Get all metrics
   * @public
   * @returns {object} An object containing all metrics and its values.
   */
  public collect(): object {
    return this.data;
  }
}

/**
 * Class that exposes the AeroGear metrics SDK for a Cordova application.
 * It is globally available trough 'window.aerogear' or simply 'aerogear', under the name
 * of MetricsService.
 * @public
 * @example
 * var MetricsService = window.aerogear.MetricsService;
 * @example
 * var metricsService = new aerogear.MetricsService({ url: "http://my-service"});
 * metricsService.sendAppAndDeviceMetrics()
 *   .then(handleResponse)
 */
export class CordovaMetricsService extends MetricsService {

  /**
   * Get some metrics about the application and device
   * @public
   * @return {Promise} A promise containing an object with the metrics
   */
  public getAppAndDeviceMetrics(): Promise<any> {
    return new Promise((res, rej) => {
      cordova.exec(
        (metrics: any) => {
          const plugins = cordova.require("cordova/plugin_list");
          const sdkVersion = plugins.metadata["core-cordova"];
          metrics.app.sdkVersion = sdkVersion;
          res(metrics);
        },
        rej,
        MOBILE_CORE_CLASS,
        "getAppAndDeviceMetrics"
      );
    });
  }

  /**
   * Send metrics about the application and device to the Metrics service.
   * @public
   * @returns {Promise} A promise containing the response from the server.
   */
  public sendAppAndDeviceMetrics(): Promise<any> {
    return this.getAppAndDeviceMetrics()
      .then(metrics => {
        const appMetrics = new MetricsImpl("app", metrics.app);
        const deviceMetrics = new MetricsImpl("device", metrics.device);

        return this.publish("init", [appMetrics, deviceMetrics]);
      });
  }

  /**
   * Get the device's client id if it stored, otherwise return undefined.
   * @private
   * @returns {string} The client id or undefined.
   */
  public getSavedClientId(): string {
    // TODO: get from device storage
    return "";
  }

  /**
   * Save a string as this device's unique client id, so it can be identified by any AeroGear service.
   * @private
   * @param {string} id - The id to be saved
   */
  public saveClientId(id: string) {
    // TODO: store in device storage
    return;
  }
}
