import {
  ConfigurationService,
  isNative
} from "@aerogear/core";
import { AbstractPushRegistration } from "./AbstractPushRegistration";
import {PushRegistrationInterface} from "./PushRegistrationInterface";
import { PushRegistrationWebpushImpl, PushRegistrationCordovaImpl } from "./impl";

export type OnMessageReceivedCallback = (notification: any) => void;

export interface PushRegistrationOptions {
  alias?: string;
  categories?: string[];
  timeout?: number;
}

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

  public static onMessageReceived(onMessageReceivedCallback: OnMessageReceivedCallback) {
    PushRegistrationCordovaImpl.onMessageReceived(onMessageReceivedCallback);
  }

  private readonly delegate: AbstractPushRegistration;

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
  public async register(options: PushRegistrationOptions = {}): Promise<void> {
    await this.delegate.register(options);
  }

  /**
   * Unregister the application from the UPS.
   */
  public async unregister(): Promise<void> {
    this.delegate.unregister();
  }
}
