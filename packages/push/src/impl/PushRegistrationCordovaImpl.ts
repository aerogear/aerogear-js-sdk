import {AbstractPushRegistration} from "../AbstractPushRegistration";
import {OnMessageReceivedCallback, PushRegistrationOptions} from "../PushRegistration";
import {ConfigurationService, isCordovaAndroid, isCordovaIOS, ServiceConfiguration} from "@aerogear/core";

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
export class PushRegistrationCordovaImpl extends AbstractPushRegistration {

  public static onMessageReceived(onMessageReceivedCallback: OnMessageReceivedCallback) {
    PushRegistrationCordovaImpl.onMessageReceivedCallback = onMessageReceivedCallback;
  }

  private static onMessageReceivedCallback: OnMessageReceivedCallback;

  private push?: any;

  constructor(config: ConfigurationService) {
    super(config);
  }

  /**
   * Register deviceToken for Android or IOS platforms
   *
   * @param options Push registration options
   */
  public register(options: PushRegistrationOptions = {}): Promise<void> {

    const {alias, categories, timeout} = options;

    if (this.validationError) {
      return Promise.reject(new Error(this.validationError));
    }

    return new Promise((resolve, reject) => {

      setTimeout(
        () => reject("UnifiedPush registration timeout"),
        (timeout) ? timeout : AbstractPushRegistration.REGISTRATION_TIMEOUT
      );

      this.push.on("registration", (data: any) => {

        if (this.httpClient) {
          const postData = {
            "deviceToken": data.registrationId,
            "deviceType": window.device.model,
            "operatingSystem": window.device.platform,
            "osVersion": window.device.version,
            "alias": alias,
            "categories": categories
          };

          return this.httpClient.post(AbstractPushRegistration.API_PATH, postData)
            .then(() => {
                if (isCordovaAndroid() && this.variantId) {
                  this.subscribeToFirebaseTopic(this.variantId);
                  if (options.categories) {
                    for (const category of options.categories) {
                      this.subscribeToFirebaseTopic(category);
                    }
                  }
                }

                const storage = window.localStorage;
                storage.setItem(AbstractPushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(postData));

                this.push
                  .on("notification", (notification: any) => {
                    if (PushRegistrationCordovaImpl.onMessageReceivedCallback) {
                      PushRegistrationCordovaImpl.onMessageReceivedCallback(notification);
                    }
                  });

                resolve();
              }
            )
            .catch(reject);

        } else {
          // It should never happend but...
          return reject(new Error("Push is not properly configured"));
        }

      });
    });
  }

  /**
   * Unregister device for Android or IOS platforms
   */
  public unregister(): Promise<void> {

    if (this.validationError) {
      return Promise.reject(new Error(this.validationError));
    }

    const storage = window.localStorage;
    const jsonCachedData = storage.getItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);

    let postData;
    let deviceToken = "";
    let categories: string[] = [];

    if (jsonCachedData) {
      postData = JSON.parse(jsonCachedData);
      deviceToken = postData.deviceToken;
      categories = postData.categories;
    }

    if (!deviceToken) {
      return Promise.reject(new Error("Device token should not be empty"));
    }

    return new Promise((resolve, reject) => {
      if (this.httpClient) {
        const endpoint = AbstractPushRegistration.API_PATH + "/" + deviceToken;
        return this.httpClient.delete(endpoint, {})
          .then(() => {

            if (isCordovaAndroid() && this.variantId) {
              this.unsubscribeToFirebaseTopic(this.variantId);
              if (categories) {
                for (const category of categories) {
                  this.unsubscribeToFirebaseTopic(category);
                }
              }
            }

            storage.removeItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);

            resolve();
          })
          .catch(reject);
      } else {
        // It should never happend but...
        return reject(new Error("Push is not properly configured"));
      }
    });
  }

  public getPlatformConfig(pushConfig: ServiceConfiguration): any {
    if (isCordovaAndroid()) {
      return pushConfig.config.android;
    } else if (isCordovaIOS()) {
      return pushConfig.config.ios;
    }
    return undefined;
  }

  protected validateConfig(pushConfig: ServiceConfiguration): string | undefined {
    if (!window || !window.device || !window.PushNotification) {
      return "@aerogear/cordova-plugin-aerogear-push plugin not installed.";
    }
    return undefined;
  }

  protected init(): void {
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
  }

  private async subscribeToWebPush(appServerKey: string) {

    if ("serviceWorker" in navigator) {
      const permission = await window.Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Unable to subscribe to WebPush: no permissions");
        return;
      }
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(appServerKey)
      };

      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      const subscription = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null,
            Array.from(new Uint8Array(pushSubscription.getKey("p256dh") as ArrayBuffer)))),
          auth: btoa(String.fromCharCode.apply(null,
            Array.from(new Uint8Array(pushSubscription.getKey("auth") as ArrayBuffer))))
        }
      };

      return subscription;
    }
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

  private unsubscribeToFirebaseTopic(topic: string) {
    this.push.unsubscribe(
      topic,
      () => {
        console.warn("FCM topic: " + topic + " unsubscribed");
      },
      (e: any) => {
        console.warn("error:", e);
      }
    );
  }
}

/**
 * urlBase64ToUint8Array
 *
 * @param {string} base64String a public vavid key
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
