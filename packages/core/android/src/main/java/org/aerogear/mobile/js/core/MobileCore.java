package org.aerogear.mobile.js.core;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Build;


import org.json.JSONException;
import org.json.JSONObject;

public class MobileCore {

  public final String SERVICE_NAME = "MobileCore";
  private Context context;

  public MobileCore(Context context) {
    this.context = context;
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
    String packageName = this.context.getPackageName();
    PackageInfo packageInfo = this.context.getPackageManager()
    .getPackageInfo(packageName, 0);

    final JSONObject appMetrics = new JSONObject();
    appMetrics.put("appId", packageName);
    // sdkVersion is included in package.json, it must be added by JS interface
    appMetrics.put("sdkVersion", "");
    appMetrics.put("appVersion", packageInfo.versionName);

    return appMetrics;
  }
}
