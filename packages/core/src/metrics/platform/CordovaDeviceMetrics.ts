import { DeviceMetrics, Metrics } from "../model";

// plugin's JS interface
declare var aerogear: {
  getDeviceMetrics(): Promise<DeviceMetrics>;
};

export class CordovaDeviceMetrics implements Metrics {

  public identifier = "device";

  public collect(): Promise<DeviceMetrics> {
    // Get device metrics from plugin cordova-plugin-aerogear-metrics
    return aerogear.getDeviceMetrics();
  }
}
