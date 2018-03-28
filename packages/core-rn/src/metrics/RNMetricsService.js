import { NativeModules } from "react-native";
import { MetricsService } from "@aerogearservices/core";

const RNMobileCore = NativeModules.MobileCore;

class RNMetricsService extends MetricsService {

  async sendAppAndDeviceMetrics() {
    const deviceMetrics = await RNMobileCore.getDeviceMetrics();
    const appMetrics = await RNMobileCore.getAppMetrics();

    // What platform? Android/iOS or RN-Android, RN-iOS, Cordova-Android...

    // What SDK? Core or Cordova/RN-Core?
    appMetrics.sdkVersion = "0.0.1";

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
