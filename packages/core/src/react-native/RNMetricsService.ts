import Promise from "bluebird";
import {NativeModules} from "react-native";
import {MetricsService} from "../metrics/MetricsService";
import {MetricsImpl} from "../metrics/model";

const MOBILE_CORE_CLASS = "MobileCore";

const NativeCore = NativeModules[MOBILE_CORE_CLASS];
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
export class RNMetricsService extends MetricsService {

  /**
   * Get some metrics about the application and device
   * @public
   * @return {Promise} A promise containing an object with the metrics
   */
  public getAppAndDeviceMetrics(): Promise<any> {
    return NativeCore.getAppAndDeviceMetrics();
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
