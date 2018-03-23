import axios from "axios";
import ServiceConfiguration from "../configuration/ServiceConfiguration";
import ServiceModule from "../ServiceModule";
import Metrics from "./Metrics";

class MetricsService implements ServiceModule {

  public readonly type: string = "metrics";

  private readonly url: string;

  constructor(configuration: ServiceConfiguration) {
    this.url = configuration.url;
  }

  public sendAppAndDeviceMetrics(metrics: Metrics): Promise<any> {
    return axios.post(this.url, metrics);
  }
}

export default MetricsService;
