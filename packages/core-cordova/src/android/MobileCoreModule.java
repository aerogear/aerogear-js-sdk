package org.aerogear.mobile.core;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.os.Build;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

public class MobileCoreModule extends CordovaPlugin {

  public MobileCoreModule() {}

  public MobileCoreModule(Context context) {}

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    // Initialization logic here
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("getMetrics")) {
      getDeviceMetrics(callbackContext);
      return true;
    }

    return false;
  }

  @Override
  public String getServiceName() {
    return "MobileCore";
  }

  public void getDeviceMetrics(CallbackContext callbackContext) {
    // try {
    //   final WritableMap deviceMetrics = Arguments.createMap();
    //   deviceMetrics.putString("platform", "android");
    //   deviceMetrics.putString("platformVersion", String.valueOf(Build.VERSION.SDK_INT));
    //   promise.resolve(deviceMetrics);

    // } catch (Exception e) {
    //   promise.reject("GetDeviceMetricsError", e.getMessage());
    // }
    callbackContext.success("Device metrics");
  }

  public void getAppMetrics(CallbackContext callbackContext) {
    // try {
    //   String packageName = reactContext.getPackageName();
    //   PackageInfo packageInfo = reactContext.getPackageManager()
    //     .getPackageInfo(packageName, 0);

    //   final WritableMap appMetrics = Arguments.createMap();
    //   appMetrics.putString("appId", packageName);
    //   appMetrics.putString("appVersion", packageInfo.versionName);
    //   promise.resolve(appMetrics);

    // } catch (Exception e) {
    //   promise.reject("GetAppMetricsError", e.getMessage());
    // }
    callbackContext.success("App metrics");
  }
}