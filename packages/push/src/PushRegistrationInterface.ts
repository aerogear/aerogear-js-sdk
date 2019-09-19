import {PushRegistrationOptions} from "./PushRegistration";

/**
 * Interface for PushRegistration objects.
 */
export interface PushRegistrationInterface {
  register(options: PushRegistrationOptions): Promise<void>;
  unregister(): Promise<void>;
}
