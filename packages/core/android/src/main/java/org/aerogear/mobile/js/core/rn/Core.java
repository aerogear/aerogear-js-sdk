package org.aerogear.mobile.js.core.rn;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.aerogear.mobile.js.core.MobileCore;
import org.json.JSONObject;

public class Core extends ReactContextBaseJavaModule {

  private final MobileCore core;
  private final ReactApplicationContext context;

  public Core(ReactApplicationContext context) {
    super(context);
    this.context = context;
    this.core = new MobileCore(context);
  }

  @ReactMethod
  public void getAppAndDeviceMetrics(Promise promise) {
    try {
      final JSONObject metrics = this.core.getAppAndDeviceMetrics();
      promise.resolve(metrics);
    } catch (Exception e) {
      promise.reject(e);
    }
  }

  @Override
  public String getName() {
    return this.core.SERVICE_NAME;
  }
}
