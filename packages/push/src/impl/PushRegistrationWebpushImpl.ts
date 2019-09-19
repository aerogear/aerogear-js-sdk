import {AbstractPushRegistration} from "../AbstractPushRegistration";
import {ConfigurationService, ServiceConfiguration} from "@aerogear/core";
import {PushRegistrationOptions} from "../PushRegistration";

declare var window: any;

/**
 * AeroGear UPS registration SDK - Webpush implementation
 *
 * Usage:
 * // Initialize SDK first
 * app.init(config);
 * let registration = new PushRegistration();
 * registration.register("myAppleOrFirebaseToken");
 */
export class PushRegistrationWebpushImpl extends AbstractPushRegistration {
  constructor(config: ConfigurationService) {
    super(config);
    // The config is valid
  }

  public async register(options: PushRegistrationOptions): Promise<void> {
    const {alias, categories, timeout} = options;

    if (this.validationError) {
      throw new Error(this.validationError);
    }

    if (this.httpClient) {
      const subscription = await this.subscribeToWebPush(this.platformConfig.appServerKey);
      const postData = {
        "deviceToken": JSON.stringify(subscription),
        "deviceType": "ChromeBrowser",
        "operatingSystem": "WebPush",
        "osVersion": "6.1.2",
        "alias": alias,
        "categories": categories
      };

      await this.httpClient.post(AbstractPushRegistration.API_PATH, postData);
      const storage = window.localStorage;
      storage.setItem(AbstractPushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(postData));
    } else {
      // It should never happend but...
      throw new Error("Push is not properly configured");
    }
  }

  // TODO: implement
  // tslint:disable-next-line: no-empty
  public async unregister(): Promise<void> {
    await super.unregister();
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
  }

  public getPlatformConfig(pushConfig: ServiceConfiguration): any {
    return pushConfig.config.web_push;
  }

  private waitForServiceWorkerToBeReady(reg: ServiceWorkerRegistration) {
    let serviceWorker: ServiceWorker | undefined;

    if (reg.installing) {
      serviceWorker = reg.installing;
    } else if (reg.waiting) {
      serviceWorker = reg.waiting;
    } else if (reg.active) {
      serviceWorker = reg.active;
    }

    return new Promise(resolve => {
      if (serviceWorker) {
        if (serviceWorker.state === "activated") {
          resolve();
        }
        serviceWorker.addEventListener("statechange", (e: any) => {
          if (e.target.state === "activated") {
            resolve();
          }
        });
      }
    });
  }

  private async subscribeToWebPush(appServerKey: string): Promise<any> {
    if ("serviceWorker" in navigator) {
      const permission = await window.Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Unable to subscribe to WebPush: no permissions");
        return;
      }
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      await this.waitForServiceWorkerToBeReady(registration);

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
