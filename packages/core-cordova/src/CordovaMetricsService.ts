import { Metrics, MetricsService } from "@aerogearservices/core";
import packageJson from "../package.json";
import { NativeModuleProxy } from "./NativeModuleProxy";

export class CordovaMetricsService extends MetricsService {

  /**
   * Get app and device related metrics
   */
  public getAppAndDeviceMetrics(): Promise<any> {
    return NativeModuleProxy.getAppAndDeviceMetrics();
  }

  /**
   * Send app and device related metrics to a backend metrics service
   */
  public async sendAppAndDeviceMetrics(): Promise<any> {
    const appAndDeviceMetrics = await this.getAppAndDeviceMetrics();

    appAndDeviceMetrics.app.sdkVersion = packageJson.version;

    const appMetrics = new MetricsImpl("app", appAndDeviceMetrics.app);
    const deviceMetrics = new MetricsImpl("device", appAndDeviceMetrics.device);

    return super.publish([appMetrics, deviceMetrics]);
  }

  protected getSavedClientId(): string | undefined {
    // TODO: get stored id from device's persistent storage
    return undefined;
  }

  protected saveClientId(id: string): void {
    // TODO: store client id persistently in device
    return;
  }

}

class MetricsImpl implements Metrics {

  constructor(
    public readonly identifier: string,
    private readonly data: any
  ) { }

  public collect(): any {
    return this.data;
  }
}
