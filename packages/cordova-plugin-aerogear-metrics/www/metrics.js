
/**
 * Get device metrics, to be called after deviceReady event
 * 
 * It uses cordova-plugin-device plugin.
 * @example
 * const deviceMetrics = await aerogear.getDeviceMetrics();
 * @returns {Promise<DeviceMetrics>} The device metrics
 */
exports.getDeviceMetrics = function () {
  return new Promise(function (res, rej) {
    res({
      platform: device.platform,
      platformVersion: device.version,
      device: device.model
    });
  });
};

/**
 * Get app metrics, to be called after deviceReady event.
 * 
 * It uses cordova-plugin-app-version to get the app version, the rest of the metrics are to be
 * filled up by the app itself.
 * @example
 * const appMetrics = await aerogear.getAppMetrics();
 * @returns {Promise<AppMetrics>} A promise containing the app metrics
 */
exports.getAppMetrics = function () {
  var app = cordova.getAppVersion;
  return Promise.all([
    app.getPackageName(),
    app.getVersionNumber()
  ])
    .then(function (results) {
      return {
        appId: results[0],
        appVersion: results[1],
        sdkVersion: ""
      };
    });
};
