import {
  ConfigurationService,
  isNative
} from "@aerogear/core";
import {
  PushRegistrationInterface,
  PushRegistrationOptions,
  PushRegistrationWebpushOptions } from "./PushRegistrationInterface";
import { PushRegistrationWebpushImpl, PushRegistrationCordovaImpl } from "./impl";

export type OnMessageReceivedCallback = (notification: any) => void;

export { PushRegistrationOptions, PushRegistrationWebpushOptions } from "./PushRegistrationInterface";

/**
 * AeroGear UPS registration SDK
 *
 * Usage:
 * // Initialize SDK first
 * app.init(config);
 * let registration = new PushRegistration();
 * registration.register("myAppleOrFirebaseToken");
 */
export class PushRegistration implements PushRegistrationInterface {

  /**
   * Register the callback that will receive the push message
   * @param onMessageReceivedCallback
   */
  public static onMessageReceived(onMessageReceivedCallback: OnMessageReceivedCallback) {
    if (!isNative()) {
      PushRegistrationWebpushImpl.onMessageReceived(onMessageReceivedCallback);
    } else {
      PushRegistrationCordovaImpl.onMessageReceived(onMessageReceivedCallback);
    }
  }

  private readonly delegate: PushRegistrationInterface;

  constructor(config: ConfigurationService) {
    if (!isNative()) {
      this.delegate = new PushRegistrationWebpushImpl(config);
    } else {
      this.delegate = new PushRegistrationCordovaImpl(config);
    }
  }

  /**
   * Register the application to the UPS.
   * @param options
   */
  public async register(options: PushRegistrationOptions | PushRegistrationWebpushOptions = {}): Promise<void> {
    await this.delegate.register(options);
  }

  /**
   * Unregister the application from the UPS.
   */
  public async unregister(): Promise<void> {
    await this.delegate.unregister();
  }
}
