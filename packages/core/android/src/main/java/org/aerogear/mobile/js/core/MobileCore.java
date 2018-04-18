package org.aerogear.mobile.core;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;
import org.aerogear.android.core.BuildConfig;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

// TODO: refactor `extends CordovaPlugin` to cordova-specific wrapper
public class MobileCore {

  public final String SERVICE_NAME = "MobileCore";

  public MobileCore() {
  }

  public MobileCore(Context context) {
  }

  public static String getSdkVersion() {
    return BuildConfig.VERSION_NAME;
  }

  public JSONObject getAppAndDeviceMetrics() throws NameNotFoundException, JSONException {
    JSONObject metrics = new JSONObject();

    metrics.put("app", getAppMetrics());
    metrics.put("device", getDeviceMetrics());

    return metrics;
  }

  public JSONObject getDeviceMetrics() throws JSONException {
    final JSONObject deviceMetrics = new JSONObject();
    deviceMetrics.put("platform", "android");
    deviceMetrics.put("platformVersion", String.valueOf(Build.VERSION.SDK_INT));

    return deviceMetrics;
  }

  public JSONObject getAppMetrics() throws JSONException, NameNotFoundException {
    String packageName = this.cordova.getActivity().getPackageName();
    PackageInfo packageInfo = this.cordova.getActivity().getPackageManager()
      .getPackageInfo(packageName, 0);

    final JSONObject appMetrics = new JSONObject();
    appMetrics.put("appId", packageName);
    // sdkVersion is included in package.json, it must be added by JS interface
    appMetrics.put("sdkVersion", "");
    appMetrics.put("appVersion", packageInfo.versionName);

    return appMetrics;
  }
}
