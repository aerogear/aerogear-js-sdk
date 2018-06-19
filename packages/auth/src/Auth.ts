// @ts-ignore
import {
  INSTANCE,
  ServiceConfiguration
} from "@aerogear/core";
import Keycloak from "keycloak-js"; 
import {
  KeycloakError,
  KeycloakInitOptions,
  KeycloakInstance,
  KeycloakProfile,
  KeycloakPromise
} from "keycloak-js";
import { readJson } from "fs-extra";
//import console from "loglevel";

declare var window: any;

/**
 * AeroGear Auth SDK.
 * Wrapper class for {Keycloak.KeycloakInstance}
 */
export class Auth {

  public static readonly TYPE: string = "keycloak";

  private auth: KeycloakInstance;
  private internalConfig: any;

  private initOptions: any;
  private loginResolve: any;
  private loginError: any;
  private logoutResolve: any;
  private logoutError: any;

  constructor() {
    const configuration = INSTANCE.getConfigByType(Auth.TYPE);
    if (configuration && configuration.length > 0) {
      const serviceConfiguration: ServiceConfiguration = configuration[0];
      this.internalConfig = serviceConfiguration.config;
      // create a resource field containing the clientID. The keycloak JS adapter expects a clientId.
      if (!this.internalConfig.clientId) {
        this.internalConfig.clientId = this.internalConfig.resource;
      }
      // use the top level keycloak url in the mobile services json
      this.internalConfig.url = serviceConfiguration.url;
    } else {
      console.warn("Keycloak configuration is missing. Authentication will not work properly.");
    }
    this.auth = Keycloak(this.internalConfig);
  }

  /**
   * Called to initialize the adapter.
   * @param initOptions Initialization options.
   * @returns A promise to set functions to be invoked on success or error.
   */
  public init(initOptions: KeycloakInitOptions): Promise < boolean > {
    if (!initOptions.onLoad) {
      initOptions.onLoad = "check-sso";
    }
    var self = this;
    self.initOptions = initOptions;
    return new Promise((resolve, reject) => {
      return this.auth.init(initOptions).success(resolve).error(reject);
    });
  }

  /**
   * Loads the user's profile.
   * @returns A promise to set functions to be invoked on success or error.
   */
  public loadUserProfile(): Promise < KeycloakProfile > {
    return new Promise((resolve, reject) => {
      return this.auth.loadUserProfile().error(reject).success(resolve);
    });
  }

  /**
   * Redirects to login form.
   * @param options Login options.
   */
  public login(options: any): Promise <any>{
    var self = this;
    return new Promise((resolve, reject) => {
      self.loginResolve = resolve;
      self.loginError = reject;
      return this.auth.login(options);
    });
  }

  public continueLogin(url: string) {
    window['callbackUrl'] = url;
    this.auth.init(this.initOptions).success(this.loginResolve).error(this.loginError);
  }

  /**
   * Redirects to logout.
   * @param options Logout options.
   * @param options.redirectUri Specifies the uri to redirect to after logout.
   */
  public logout(options: any): Promise <any> {
    var self = this;
    return new Promise((resolve, reject) => {
      self.logoutResolve = resolve;
      self.logoutError = reject
      return this.auth.logout(options);
    });
  }

  public continueLogout() {
    this.auth.init(this.initOptions).success(this.logoutResolve).error(this.logoutError);
  }

  public isAuthenticated(): boolean {
    return !!this.auth.authenticated;
  }

  /**
   * Get access to wrapped Keycloak object
   */
  public extract(): KeycloakInstance {
    return this.auth;
  }

  /**
   * Check it the user has a specified realm role
   */
  public hasRealmRole(role: string): boolean {
    return this.auth.hasRealmRole(role);
  }

  /**
   * Return the users realm level roles
   */
  public getRealmRoles(): string[] {
    if (this.auth.realmAccess && this.auth.realmAccess.roles) {
      return this.auth.realmAccess.roles;
    }
    return [];
  }
  /**
   * Return the config used for the auth service
   */
  public getConfig(): string[] {
    return this.internalConfig;
  }

  /**
   * Return true if config is present
   */
  public hasConfig(): boolean {
    const configuration = INSTANCE.getConfigByType(Auth.TYPE);
    return !!(configuration && configuration.length > 0);
  }
}
