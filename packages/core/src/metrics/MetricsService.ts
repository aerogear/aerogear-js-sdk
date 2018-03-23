import axios from "axios";
import ServiceConfiguration from "../configuration/ServiceConfiguration";
import ServiceModule from "../ServiceModule";
import Metrics from "./Metrics";

class MetricsService implements ServiceModule {

  public readonly type: string = "metrics";

  private readonly url: URL;

  constructor(configuration: ServiceConfiguration) {
    this.url = new URL(configuration.url);
  }

  public sendAppAndDeviceMetrics(metrics: Metrics): Promise<any> {
    return axios.post(this.url.toString(), metrics);
  }
}

export default MetricsService;
