import AppMetrics from "./AppMetrics";
import DeviceMetrics from "./DeviceMetrics";
import SecurityMetric from "./SecurityMetric";

interface MetricsData {

  app?: AppMetrics;
  device?: DeviceMetrics;
  security?: SecurityMetric[];

}

export default MetricsData;
