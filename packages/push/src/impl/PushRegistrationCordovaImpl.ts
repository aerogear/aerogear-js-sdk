import { AbstractPushRegistration } from "../AbstractPushRegistration";
import { OnMessageReceivedCallback, PushRegistrationOptions } from "../PushRegistration";
import { isCordovaAndroid, isCordovaIOS, ServiceConfiguration } from "@aerogear/core";

declare var window: any;

/**
 * AeroGear UPS registration SDK - Cordova based implementation
 *
 * Usage:

 * let registration = new PushRegistrationCordovaImpl(config);
 * registration.register("myAppleOrFirebaseToken");
 */
export class PushRegistrationCordovaImpl extends AbstractPushRegistration {

  public static onMessageReceived(onMessageReceivedCallback: OnMessageReceivedCallback) {
    PushRegistrationCordovaImpl.onMessageReceivedCallback = onMessageReceivedCallback;
  }

  private static onMessageReceivedCallback: OnMessageReceivedCallback;

  private push?: any;

  constructor(config: ServiceConfiguration) {
    super(config);
  }

  /**
   * Register deviceToken for Android or IOS platforms
   *
   * @param options Push registration options
   */
  public register(options: PushRegistrationOptions = {}): Promise<void> {

    const { alias, categories, timeout } = options;

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
    const storage = window.localStorage;
    const jsonCachedData = storage.getItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);

    return new Promise((resolve, reject) => {
      super.unregister().then(() => {
        let postData;
        let categories;
        if (jsonCachedData) {
          postData = JSON.parse(jsonCachedData);
          categories = postData.categories;
        }

        if (isCordovaAndroid() && this.variantId) {
          this.unsubscribeToFirebaseTopic(this.variantId);
          if (categories) {
            for (const category of categories) {
              this.unsubscribeToFirebaseTopic(category);
            }
          }
        }
        resolve();
      }).catch(reject);
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
