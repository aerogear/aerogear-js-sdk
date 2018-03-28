import { NativeModules } from "react-native";
import { MetricsService } from "@aerogearservices/core";
import packageJson from "../../package.json";

const RNMobileCore = NativeModules.MobileCore;

class RNMetricsService extends MetricsService {

  async sendAppAndDeviceMetrics() {
    const deviceMetrics = await RNMobileCore.getDeviceMetrics();
    const appMetrics = await RNMobileCore.getAppMetrics();

    appMetrics.sdkVersion = packageJson.version + "-rn";

    const metrics = {
      clientId: super.getClientId(),
      timestamp: new Date().getTime(),
      data: {
        app: appMetrics,
        device: deviceMetrics
      }
    }

    return super.sendMetrics(metrics);
  }
}

export default RNMetricsService;
