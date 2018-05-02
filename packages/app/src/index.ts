import { AeroGearConfiguration, ConfigurationHelper } from "@aerogear/core";

declare var window: any;

let config: ConfigurationHelper;

export function init(configuration: AeroGearConfiguration) {
  config = new ConfigurationHelper(configuration);
  window.Metrics.init(config);
}

export function getAuth() {
  if (config && window.Auth) {
    window.Auth.init(config);
    return window.Auth;
  }
}
