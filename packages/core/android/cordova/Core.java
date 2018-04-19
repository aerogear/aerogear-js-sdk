package org.aerogear.mobile.js.core.cordova;

import android.content.pm.PackageManager.NameNotFoundException;

import org.aerogear.mobile.js.core.MobileCore;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class Core extends CordovaPlugin {

  private MobileCore core;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.core = new MobileCore(cordova.getContext());
  }

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
    return this.core.SERVICE_NAME;
  }

  public JSONObject getAppAndDeviceMetrics() throws NameNotFoundException, JSONException {
    return this.core.getAppAndDeviceMetrics();
  }
}
