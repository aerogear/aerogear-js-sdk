import {
  ConfigurationService,
  isCordovaAndroid,
  isCordovaIOS
} from "@aerogear/core";
import axios, { AxiosInstance } from "axios";

declare var window: any;

/**
 * AeroGear UPS registration SDK
 *
 * Usage:
 * // Initialize SDK first
 * app.init(config);
 * let registration = new PushRegistration();
 * registration.register("myAppleOrFirebaseToken");
 */
export class PushRegistration {

  public static readonly TYPE: string = "push";

  private static readonly API_PATH: string = "rest/registry/device";
  private static readonly TOKEN_KEY = "UPS_DEVICE_TOKEN";

  private readonly validationError?: string;
  private readonly variantId?: string;
  private readonly httpClient?: AxiosInstance;
  private readonly push?: any;

  constructor(config: ConfigurationService) {
    const configuration = config.getConfigByType(PushRegistration.TYPE);

    if (configuration && configuration.length > 0) {
      const pushConfig = configuration[0];

      if (!window || !window.device || !window.PushNotification) {
        const errorMessage = "@aerogear/cordova-plugin-aerogear-push plugin not installed.";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      if (!pushConfig || !pushConfig.config) {
        const errorMessage = "UnifiedPush server configuration not found";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      const unifiedPushServerURL = pushConfig.url;
      if (!pushConfig.url) {
        const errorMessage = "UnifiedPush server URL not found";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      let platformConfig;
      if (isCordovaAndroid()) {
        platformConfig = pushConfig.config.android;
      } else if (isCordovaIOS()) {
        platformConfig = pushConfig.config.ios;
      } else {
        const errorMessage = "Platform is not supported by UnifiedPush";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      this.variantId = platformConfig.variantId || platformConfig.variantID;
      if (!this.variantId) {
        const errorMessage = "UnifiedPush VariantId is not defined";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      const variantSecret = platformConfig.variantSecret;
      if (!variantSecret) {
        const errorMessage = "UnifiedPush VariantSecret is not defined";
        this.validationError = errorMessage;
        console.warn(errorMessage);
      }

      if (!this.validationError) {
        const token = window.btoa(`${this.variantId}:${variantSecret}`);
        this.httpClient = axios.create({
          baseURL: unifiedPushServerURL,
          timeout: 5000,
          headers: {"Authorization": `Basic ${token}`}
        });
      }

      this.push = window.PushNotification.init(
        {
          android: {},
          ios: {
            alert: true,
            badge: true,
            sound: true
          }
        }
      );

    } else {
      console.warn("Push configuration is missing. UPS server registration will not work.");
    }
  }

  /**
   * Register deviceToken for Android or IOS platforms
   *
   * @param deviceToken token that will be sent to Unified Push server
   * @param alias device alias used for registration
   * @param categories array list of categories that device should be register to.
   */
  public register(deviceToken: string, alias: string = "", categories: string[] = []): Promise<void> {

    if (!deviceToken) {
      return Promise.reject(new Error("Device token should not be empty"));
    }

    if (this.validationError) {
      return Promise.reject(new Error(this.validationError));
    }

    const postData = {
      "deviceToken": deviceToken,
      "deviceType": window.device.model,
      "operatingSystem": window.device.platform,
      "osVersion": window.device.version,
      "alias": alias,
      "categories": categories
    };

    return new Promise((resolve, reject) => {
      if (this.httpClient) {
        return this.httpClient.post(PushRegistration.API_PATH, postData)
        .then(
          () => {
            const storage = window.localStorage;
            storage.setItem(PushRegistration.TOKEN_KEY, deviceToken);

            if (isCordovaAndroid() && this.variantId) {
              this.subscribeToFirebaseTopic(this.variantId);
              for (const category of categories) {
                this.subscribeToFirebaseTopic(category);
              }
            }

            resolve();
          }
        )
        .catch(reject);
      } else {
        // It should never happend but...
        return Promise.reject(new Error("Push is not properly configured"));
      }
    });
  }

  /**
   * Unregister device for Android or IOS platforms
   */
  public unregister(): Promise<void> {

    const storage = window.localStorage;
    const deviceToken = storage.getItem(PushRegistration.TOKEN_KEY);

    if (!deviceToken) {
      return Promise.reject(new Error("Device token should not be empty"));
    }

    if (this.validationError) {
      return Promise.reject(new Error(this.validationError));
    }

    return new Promise((resolve, reject) => {
      if (this.httpClient) {
        const endpoint = PushRegistration.API_PATH + "/" + deviceToken;
        return this.httpClient.delete(endpoint, {})
        .then(() => resolve())
        .catch(reject);
      } else {
        // It should never happend but...
        return Promise.reject(new Error("Push is not properly configured"));
      }
    });
  }

  private subscribeToFirebaseTopic(topic: string) {
    this.push.subscribe(
      topic,
      () => {
        console.warn("FCM topic: " + topic + " subscribed");
      },
      (e: any) => {
        console.warn("error:", e);
      }
    );
  }

}
