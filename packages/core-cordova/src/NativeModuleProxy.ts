declare var cordova: any;

const MODULE_CLASS_NAME = "MobileCoreModule";

const METHOD_GET_METRICS = "getMetrics";

/**
 * Proxy for all the native methods included in the plugin
 */
export class NativeModuleProxy {

  /**
   * Get metrics related with app and client device. It returns a JSON object as it follows:
   * @example
   * {
   *   app: { appId, appVersion },
   *   device: { platform, platformVersion }
   * }
   */
  public static getAppAndDeviceMetrics(): Promise<any> {
    return new Promise<any>((
      resolve: (metrics: any) => void,
      reject: (error: string) => void
    ) => {
      cordova.exec(resolve, reject, MODULE_CLASS_NAME, METHOD_GET_METRICS);
    });
  }
}
