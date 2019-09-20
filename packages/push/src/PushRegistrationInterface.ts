export interface PushRegistrationOptions {
  alias?: string;
  categories?: string[];
  timeout?: number;
}

export interface PushRegistrationWebpushOptions extends PushRegistrationOptions {
  serviceWorker?: string;
}

/**
 * Interface for PushRegistration objects.
 */
export interface PushRegistrationInterface {
  register(options: PushRegistrationOptions | PushRegistrationWebpushOptions): Promise<void>;
  unregister(): Promise<void>;
}
