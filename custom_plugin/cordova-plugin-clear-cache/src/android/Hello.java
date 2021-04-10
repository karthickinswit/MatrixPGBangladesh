package com.appiyo.photoaudit;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;


public class Hello extends CordovaPlugin {

    private static final String LOG_TAG = "ClearCache";
    @Override
    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
	Log.i(LOG_TAG, "Called action: " + action);
        if (action.equals("clearCache")) {

            try {
				final MainActivity activity = ((MainActivity)this.cordova.getActivity());
				activity.runOnUiThread(new Runnable() {
			        public void run() {
						System.out.println("Clear Cache");
			        	activity.clearCache(true);
			        }
			    });
				
			} catch (Exception e) {
				Log.e(LOG_TAG, "Exception occurred: ".concat(e.getMessage()));
				return false;
			}
			callbackContext.success();

            return true;

        } else {
            
            return false;

        }
    }
}
