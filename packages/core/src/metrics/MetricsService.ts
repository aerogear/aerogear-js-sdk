import ServiceModule from "../ServiceModule";

class MetricsService implements ServiceModule {

  public readonly type: string = "metrics";

  public getAppAndDeviceMetrics(): any {
    // TODO: gather app and device metrics
    const metrics = {};

    // TODO: send metrics to app metrics server

    return undefined;
  }

  // TODO: sendAppAndDeviceMetrics()
}

export default MetricsService;
