/**
 * @module @aerogearservices/core
 */


export class Config {

 private serviceConfig: any[] = [];

 /**
  * @param config - any type of configuration that will be send from server.
  * It's not possible easy/worth to wrap that to types. Even native implementations do not do that.
  */
  constructor(config: any) {
    if(config && config.services){
      this.serviceConfig = config.services;
    }
  }

  public getKeycloakConfig(): any {
    return this.configByKey('keycloak')
  }

  public getMetricsConfig(): any {
    return this.configByKey('metrics')
  }

  public configByKey(key: String): any {
    return this.serviceConfig.filter(config => config.type = key);
  }
}

export default Config
