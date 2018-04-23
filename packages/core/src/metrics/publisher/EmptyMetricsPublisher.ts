import { MetricsPayload } from "../model";
import { MetricsPublisher } from "./MetricsPublisher";

export class EmptyMetricsPublisher implements MetricsPublisher {

  public publish(metrics: MetricsPayload): Promise<any> {
    return new Promise((res, rej) => {
      res();
    });
  }

}
