import { AppMetrics, Metrics } from "../model";

// plugin's JS interface
declare var aerogear: {
  getAppMetrics(): Promise<AppMetrics>;
};

export class CordovaAppMetrics implements Metrics {

  public identifier = "app";

  public collect(): Promise<AppMetrics> {
    // Get app metrics from plugin cordova-plugin-aerogear-metrics
    return aerogear.getAppMetrics();
  }
}
