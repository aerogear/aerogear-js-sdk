/**
 * @module aerogear-core
 */
export interface ServiceConfiguration {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly url: string;
  readonly config: Map<string, string>;
}

export interface Metrics {
  clientId: string;
  timestamp?: number;
  data: MetricsData;
}

export interface MetricsData {
  app?: AppMetrics;
  device?: DeviceMetrics;
  security?: SecurityMetric[];
}

export interface AppMetrics {
  appId: string;
  sdkVersion: string;
  appVersion: string;
}

export interface DeviceMetrics {
  platform: string;
  platformVersion: string;
}

export interface SecurityMetric {
  type: string;
  name: string;
  passed: boolean;
}

export declare class MetricsService implements ServiceModule {
  public readonly type: string;
  public readonly configuration: ServiceConfiguration;
  constructor();
  protected sendMetrics(metrics: Metrics): Promise<any>;
  protected getClientId(): string;
}

export interface ServiceModule {
  readonly type: string;
  readonly configuration: ServiceConfiguration;
}
