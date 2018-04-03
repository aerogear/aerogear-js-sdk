package aerogear.metrics;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import org.aerogear.mobile.core.*;

/**
 * This class echoes a string called from JavaScript.
 */
public class CordovaPluginAeroGearMetrics extends CordovaPlugin {

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("myFunc")) {
            String message = args.getString(0);
            this.myFunc(message, callbackContext);
            return true;
        }
        return false;
    }

    private void myFunc(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            callbackContext.success(message);
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }
}
