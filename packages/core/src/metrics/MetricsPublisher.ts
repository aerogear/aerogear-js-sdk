import axios from 'axios';

/**
 * Interface for classes that can publish or store metrics payload
 */
export interface MetricsPublisher {
  /**
   * Allows to publish metrics to external source
   */
   publish(payload: any): void;
}

/**
 * Metrics publisher that sends payload to remote server
 * Publisher requires remote server URL
 */
export class MetricsNetworkPublisher implements MetricsPublisher {

  constructor(private url: string) {
  }

  /**
   * Allows to publish metrics to external source
   */
  public publish(payload: any): void {
    axios.post(this.url, payload)
    .then(function(response) {
      console.info(response);
    })
    .catch(function(error) {
      console.error(error);
    });
  }
}
