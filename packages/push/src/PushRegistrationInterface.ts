import {PushRegistrationOptions} from "./PushRegistration";

export interface PushRegistrationInterface {
  register(options: PushRegistrationOptions): Promise<void>;
  unregister(): Promise<void>;
}
