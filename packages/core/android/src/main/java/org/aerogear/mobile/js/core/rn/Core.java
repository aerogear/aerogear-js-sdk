package org.aerogear.mobile.js.core.rn;

import android.content.pm.PackageManager.NameNotFoundException;

import com.facebook.react.bridge.ReactContextBaseJavaModule;

import org.aerogear.mobile.js.core.MobileCore;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Core extends ReactContextBaseJavaModule {

  public final String SERVICE_NAME = "MobileCore";
  private MobileCore core;


  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
    if (action.equals("getAppAndDeviceMetrics")) {
      try {
        callbackContext.success(getAppAndDeviceMetrics());
        return true;
      } catch (Exception e) {
        callbackContext.error(e.getMessage());
        return false;
      }
    }
    return false;
  }

  @Override
  public String getServiceName() {
    return SERVICE_NAME;
  }

  public JSONObject getAppAndDeviceMetrics() throws NameNotFoundException, JSONException {
    return this.core.getAppAndDeviceMetrics();
  }
}
