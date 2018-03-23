import MetricsData from "./MetricsData";

interface Metrics {

  clientId: string;
  timestamp?: number;
  data: MetricsData;

}

export default Metrics;
