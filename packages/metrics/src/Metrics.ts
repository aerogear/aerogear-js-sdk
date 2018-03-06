import {MetricsPublisher} from './MetricsPublisher';

/**
 * Interface used for mobile metrics management
 * Allows other SDK and implementations to manage (add) metrics
 */
export interface MetricsInterface {

  /**
   * Allows to override default metrics publisher
   *
   * @param publisher - implementation of metrics publisher
   */
  setMetricsPublisher(publisher: MetricsPublisher): void;

  /**
   * Collect application and device metrics
   * Send data instantly using active metrics publisher
   */
  sendAppAndDeviceMetrics(): void;

  /**
   * Publish user defined metrics
   *
   * @param metrics Varargs of objects implementing MetricsCollectable
   */
  publish(...metrics: Metrics[]): void;
}

/**
 * Interface used for for classes that will collect metrics
 */
export interface Metrics {
  /**
   * A identifier that is used to namespace the metrics data
   *
   * @return identifier string
   */
  identifier: string;

  /**
   * Function called when metrics need to be collected
   *
   * @return metrics dictionary object that contains metrics data
   */
  collect(): any;
}
