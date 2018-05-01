import { DeviceMetrics, Metrics } from "../model";

// plugin's JS interface
declare var device: any;

export class CordovaDeviceMetrics implements Metrics {

  public identifier = "device";

  /**
   * Get device metrics, to be called after deviceReady event
   *
   * It uses cordova-plugin-device plugin.
   * @returns {Promise<DeviceMetrics>} The device metrics
   */
  public collect(): Promise<DeviceMetrics> {
    return new Promise(function(res, rej) {
      res({
        platform: device.platform,
        platformVersion: device.version,
        device: device.model
      });
    });
  }
}
