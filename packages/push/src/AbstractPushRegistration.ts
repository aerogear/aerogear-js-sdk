import {ConfigurationService, ServiceConfiguration} from "@aerogear/core";
import {PushRegistrationOptions} from "./PushRegistration";
import { PushRegistrationInterface } from "./PushRegistrationInterface";
import {AxiosInstance} from "axios";
import axios from "axios";

export abstract class AbstractPushRegistration implements PushRegistrationInterface {

  public static readonly TYPE: string = "push";
  public static readonly REGISTRATION_DATA_KEY = "UPS_REGISTRATION_DATA";

  protected static readonly REGISTRATION_TIMEOUT = 5000;
  protected static readonly API_PATH: string = "rest/registry/device";

  protected readonly variantId?: string;
  protected readonly validationError?: string;
  protected readonly httpClient?: AxiosInstance;

  constructor(config: ConfigurationService) {
    const configuration = config.getConfigByType(AbstractPushRegistration.TYPE);
    if (configuration && configuration.length > 0) {
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
    const platformConfig = this.getPlatformConfig(pushConfig);
    this.variantId = platformConfig.variantId || platformConfig[0].variantID;
    const token = window.btoa(`${this.variantId}:${platformConfig.variantSecret}`);
    this.httpClient = axios.create({
      baseURL: pushConfig.url,
      timeout: 5000,
      headers: {"Authorization": `Basic ${token}`}
    });

    this.init();
  }

  public async abstract register(options: PushRegistrationOptions): Promise<void>;
  public async abstract unregister(): Promise<void>;

  public abstract getPlatformConfig(pushConfig: ServiceConfiguration): any;

  protected validateConfig(pushConfig: ServiceConfiguration): string | undefined {
    return undefined;
  }

  protected init(): void { }

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
