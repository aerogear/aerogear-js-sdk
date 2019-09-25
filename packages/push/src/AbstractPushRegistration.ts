import { ConfigurationService, ServiceConfiguration } from "@aerogear/core";
import { PushRegistrationOptions } from "./PushRegistration";
import { PushRegistrationInterface } from "./PushRegistrationInterface";
import { AxiosInstance} from "axios";
import axios from "axios";

/**
 * Base class for push registration managers.
 */
export abstract class AbstractPushRegistration implements PushRegistrationInterface {

  public static readonly TYPE: string = "push";
  public static readonly REGISTRATION_DATA_KEY = "UPS_REGISTRATION_DATA";

  protected static readonly REGISTRATION_TIMEOUT = 10000;
  protected static readonly API_PATH: string = "rest/registry/device";

  protected readonly variantId?: string;
  protected readonly validationError?: string | undefined;
  protected readonly httpClient?: AxiosInstance;
  protected readonly platformConfig: any;

  protected constructor(config: ConfigurationService) {
    const configuration = config.getConfigByType(AbstractPushRegistration.TYPE);
    if (configuration && configuration.length > 0 && configuration[0]) {
      this.validationError = this._validateConfig(configuration[0]);
      if (this.validationError) {
        console.warn(this.validationError);
        return;
      }
    } else {
      this.validationError = "Push configuration is missing. UPS server registration will not work.";
      console.warn(this.validationError);
      return;
    }

    // configuration is valid
    const pushConfig = configuration[0];
    this.platformConfig = this.getPlatformConfig(pushConfig);
    this.variantId = this.platformConfig.variantId || this.platformConfig.variantID;
    const token = window.btoa(`${this.variantId}:${this.platformConfig.variantSecret}`);
    this.httpClient = axios.create({
      baseURL: pushConfig.url,
      timeout: 5000,
      headers: {"Authorization": `Basic ${token}`}
    });

    this.init();
  }

  /**
   * Registers an application to the UPS.
   * @param options
   */
  public async abstract register(options: PushRegistrationOptions): Promise<void>;

  /**
   * Unregister an application form the UPS.
   */
  public async unregister(): Promise<void> {
    if (this.validationError) {
      throw new Error(this.validationError);
    }

    const storage = window.localStorage;
    const jsonCachedData = storage.getItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);

    let postData;
    let deviceToken = "";

    if (jsonCachedData) {
      postData = JSON.parse(jsonCachedData);
      deviceToken = postData.deviceToken;
    }

    if (!deviceToken) {
      throw new Error("Device token should not be empty");
    }

    if (this.httpClient) {
      const endpoint = AbstractPushRegistration.API_PATH + "/" + deviceToken;
      await this.httpClient.delete(endpoint, {});
      storage.removeItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);
    } else {
      // It should never happend but...
      throw new Error("Push is not properly configured");
    }
  }

  /**
   * Extracts the platform configuration from the current push configuration object.
   * @param pushConfig The push configuration object.
   */
  public abstract getPlatformConfig(pushConfig: ServiceConfiguration): any;

  /**
   * Performs custom validations to the configuration.
   * If this method is overridden it gets automatically called before the standard validations are executed.
   * @param pushConfig The push configuration
   * @return undefined if no errors has been found, a string containing the detail of the error otherwise.
   */
  protected validateConfig(pushConfig: ServiceConfiguration): string | undefined {
    return undefined;
  }

  /**
   * This method is immediately called after all validations has been successfully concluded.
   * Subclasses should override this to perform custom initializations.
   */
  // tslint:disable-next-line: no-empty
  protected init(): void { }

  /**
   * Performs general validation checks on the configuration.
   * @param pushConfig the configuration
   * @private
   */
  private _validateConfig(pushConfig: ServiceConfiguration): string | undefined {
    const ret = this.validateConfig(pushConfig);
    if (ret) {
      return ret;
    }

    if (!pushConfig || !pushConfig.config) {
      return "UnifiedPush server configuration not found";
    }

    if (!pushConfig.url) {
      return "UnifiedPush server URL not found";
    }

    const platformConfig = this.getPlatformConfig(pushConfig);

    if (!platformConfig) {
      return "Platform is not supported by UnifiedPush";
    }

    if (!(platformConfig.variantId || platformConfig.variantID)) {
      return "UnifiedPush VariantId is not defined";
    }

    const variantSecret = platformConfig.variantSecret;
    if (!variantSecret) {
      return "UnifiedPush VariantSecret is not defined";
    }
    return undefined;
  }
}
