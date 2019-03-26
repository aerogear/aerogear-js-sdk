import console from "loglevel";
import axios from "axios";
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
  }

  // Get device info AEROGEAR-8773
  // TODO move this functionality to the core
  public getClientData = async (): Promise<any> => {
    const metricsBuilder: MetricsBuilder = new MetricsBuilder();
    const metricsPayload: {[key: string]: any; } = {};
    const metrics = metricsBuilder.buildDefaultMetrics();
    for (const metric of metrics) {
      metricsPayload[metric.identifier] = await metric.collect();
    }
    metricsPayload.clientID = metricsBuilder.getClientId();
    return metricsPayload;
  }

  // Call the init endpoint on go mobile security service AEROGEAR-8774
  public clientInit(): Promise<any> {
    const clientInitResponse = this.getClientData()
    .then(metricsPayload => {
      const initPayload: {[key: string]: any; } = {};
      // build the initPayload
      initPayload.deviceId = metricsPayload.clientID;
      initPayload.appId = metricsPayload.app.appId,
      initPayload.deviceType = metricsPayload.device.platform;
      initPayload.deviceVersion = metricsPayload.device.platformVersion;
      initPayload.version = metricsPayload.app.appVersion;
      return axios.post(this.internalConfig.url, initPayload);
    });
    return clientInitResponse;
  }

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
