import { AbstractPushRegistration } from "../AbstractPushRegistration";
import { ConfigurationService, ServiceConfiguration } from "@aerogear/core";
import { PushRegistrationWebpushOptions } from "../PushRegistration";

declare var window: any;

const DEFAULT_SERVICE_WORKER: string = "/service-worker.js";

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

  public async register(options: PushRegistrationWebpushOptions = {}): Promise<void> {
    const {alias, categories, serviceWorker} = options;

    if (this.validationError) {
      throw new Error(this.validationError);
    }

    if (this.httpClient) {
      const subscription = await this.subscribeToWebPush(this.platformConfig.appServerKey, serviceWorker);
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

  private waitForServiceWorkerToBeReady(reg: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
    let serviceWorker: ServiceWorker | undefined;
    if (reg.installing) {
      serviceWorker = reg.installing;
    } else if (reg.waiting) {
      serviceWorker = reg.waiting;
    } else if (reg.active) {
      serviceWorker = reg.active;
    }
    return new Promise<ServiceWorkerRegistration>(resolve => {
      if (serviceWorker) {
        if (serviceWorker.state === "activated") {
          resolve(reg);
        }
        serviceWorker.addEventListener("statechange", (e: any) => {
          if (e.target.state === "activated") {
            resolve(reg);
          }
        });
      }
    });
  }

  private async aa(): Promise<ServiceWorkerRegistration> {
    return navigator.serviceWorker.ready;
  }

  private async subscribeToWebPush(appServerKey: string, serviceWorker: string = DEFAULT_SERVICE_WORKER): Promise<any> {
    if ("serviceWorker" in navigator) {
      const permission = await window.Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Unable to subscribe to WebPush: no permissions");
        return;
      }
      let registration = await navigator.serviceWorker.register(serviceWorker);
      registration = await this.waitForServiceWorkerToBeReady(registration);

      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(appServerKey)
      };
      const pushSubscription = await registration.pushManager.subscribe(subscribeOptions);
      return {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null,
            Array.from(new Uint8Array(pushSubscription.getKey("p256dh") as ArrayBuffer)))),
          auth: btoa(String.fromCharCode.apply(null,
            Array.from(new Uint8Array(pushSubscription.getKey("auth") as ArrayBuffer))))
        }
      };
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
