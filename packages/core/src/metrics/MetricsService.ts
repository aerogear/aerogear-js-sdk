import axios from "axios";
import ServiceConfiguration from "../configuration/ServiceConfiguration";
import ServiceModule from "../ServiceModule";
import Metrics from "./Metrics";

class MetricsService implements ServiceModule {

  public readonly type: string = "metrics";
  public readonly configuration: ServiceConfiguration;

  constructor(configuration: ServiceConfiguration) {
    this.configuration = configuration;
  }

  protected sendMetrics(metrics: Metrics): Promise<any> {
    return axios.post(this.configuration.url, metrics);
  }

  protected getClientId(): string {
    return "453de743207a0232a339a23e5d64b289";
  }
}

export default MetricsService;
