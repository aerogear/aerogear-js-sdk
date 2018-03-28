package org.aerogear.mobile.core;

import android.content.pm.PackageInfo;
import android.os.Build;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONObject;

public class MobileCoreModule extends ReactContextBaseJavaModule {

  private final ReactApplicationContext reactContext;

  public MobileCoreModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "MobileCore";
  }

  @ReactMethod
  public void getDeviceMetrics(Promise promise) {
    try {
      final WritableMap deviceMetrics = Arguments.createMap();
      deviceMetrics.putString("platform", "android");
      deviceMetrics.putString("platformVersion", String.valueOf(Build.VERSION.SDK_INT));
      promise.resolve(deviceMetrics);

    } catch (Exception e) {
      promise.reject("GetDeviceMetricsError", e.getMessage());
    }

  }

  @ReactMethod
  public void getAppMetrics(Promise promise) {
    try {
      String packageName = reactContext.getPackageName();
      PackageInfo packageInfo = reactContext.getPackageManager()
        .getPackageInfo(packageName, 0);

      final WritableMap appMetrics = Arguments.createMap();
      appMetrics.putString("appId", packageName);
      appMetrics.putString("appVersion", packageInfo.versionName);
      promise.resolve(appMetrics);

    } catch (Exception e) {
      promise.reject("GetAppMetricsError", e.getMessage());
    }

  }
}