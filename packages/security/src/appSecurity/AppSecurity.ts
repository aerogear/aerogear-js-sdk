import console from "loglevel";
import { ServiceConfiguration, ConfigurationService, MetricsBuilder } from "@aerogear/core";

export class AppSecurity {
  private static readonly TYPE: string = "security";
  private internalConfig: any;

  constructor(config: ConfigurationService) {
    const configuration = config.getConfigByType(AppSecurity.TYPE);
    if (configuration && configuration.length > 0) {
      const serviceConfiguration: ServiceConfiguration = configuration[0];
      this.internalConfig = serviceConfiguration.config;
      // use the configuration url in the from the incoming config file
      this.internalConfig.url = serviceConfiguration.url;
    } else {
      console.warn("Security configuration is missing. The Security module will not work properly.");
    }
    console.info("Url: ", this.internalConfig.url);
  }

  // Get device info AEROGEAR-8773
  public getClientData = async (): Promise<any> => {
    const metricsBuilder: MetricsBuilder = new MetricsBuilder();
    const metricsPayload: {
      [key: string]: any;
    } = {};
    const metrics = metricsBuilder.buildDefaultMetrics();
    for (const metric of metrics) {
      metricsPayload[metric.identifier] = await metric.collect();
    }
    return  {metricsPayload};
  }

  // TODO call init endpoint on go mobile security service AEROGEAR-8774

  // TODO need to deal with data return by init AEROGEAR-8775

  // TODO send enabled/disabled data to metrics AEROGEAR-8776

  /**
   * Return the config used for the Security server
   */
  public getConfig(): string[] {
    return this.internalConfig;
  }

  /**
   * Return true if config is present
   */
  public hasConfig(): boolean {
    return !!this.internalConfig;
  }
}
