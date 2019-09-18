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

export class PushRegistration implements PushRegistrationInterface {
  private readonly impl: AbstractPushRegistration;

  constructor(config: ConfigurationService) {
    if (!isNative()) {
      // impl must be a non cordova impl
      this.impl = new PushRegistrationWebpushImpl(config);
    } else {
      this.impl = new PushRegistrationCordovaImpl(config);
    }
  }

  public async register(options: PushRegistrationOptions = {}): Promise<void> {
    await this.impl.register(options);
  }
  public async unregister(): Promise<void> {
    this.impl.unregister();
  }
}




