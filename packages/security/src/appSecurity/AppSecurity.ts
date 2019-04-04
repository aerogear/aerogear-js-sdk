import axios from "axios";
import console from "loglevel";
import {
  ServiceConfiguration,
  ConfigurationService,
  MetricsBuilder,
  DefaultMetricsBuilder,
  isMobileCordova
 } from "@aerogear/core";

export interface AppSecurityOptions {
   metricsBuilder?: MetricsBuilder;
}

export class AppSecurity {
  private static readonly TYPE: string = "security";
  private internalConfig: any;
  private metricsBuilder: MetricsBuilder;

  constructor(config: ConfigurationService, options?: AppSecurityOptions) {
    if (!isMobileCordova()) {
      throw new Error("Cordova Platform Not Detected. This module should not be used.");
    }

    this.metricsBuilder = (options && options.metricsBuilder) ? options.metricsBuilder : new DefaultMetricsBuilder();

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

  /**
   * client Init called on device start returns app security enable/disable data
   */
  public async clientInit() {
    const defaultMetrics = this.metricsBuilder.buildDefaultMetrics();
    const defaultMetricsPayload = await this.metricsBuilder.buildMetricsPayload("security", defaultMetrics);

    const initPayload: {[key: string]: any; } = {
      deviceId: defaultMetricsPayload.clientId,
      appId: defaultMetricsPayload.data.app.appId,
      deviceType: defaultMetricsPayload.data.device.platform,
      deviceVersion: defaultMetricsPayload.data.device.platformVersion,
      version: defaultMetricsPayload.data.app.appVersion
    };

    return axios.post(`${this.internalConfig.url}/api/init`, initPayload);
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
