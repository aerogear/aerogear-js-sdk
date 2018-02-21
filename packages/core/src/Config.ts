/**
 * Service configuration model
 */
export interface IServiceConfig {
  id: string;
  name: string;
  type: string;
  url: string;
  config: any;
}

/**
 * Represents top level mobile configuration
 */
export interface IAeroGearConfig {
  version: number;
  clusterName: string;
  namespace: string;
  services?: IServiceConfig[];
}

/**
 * Represents configuration parser.
 * Class abstracts from where configuration will come from and expect
 */
export class ConfigService {
  private serviceConfig: IServiceConfig[] = [];

  /**
   * @param config - any type of configuration that will be send from server.
   */
   constructor(config: IAeroGearConfig) {
     if (config && config.services) {
       this.serviceConfig = config.services;
     }
   }

   public getKeycloakConfig(): IServiceConfig {
     return this.configByKey('keycloak');
   }

   public getMetricsConfig(): IServiceConfig {
     return this.configByKey('metrics');
   }

   public configByKey(key: string): any {
     const array = this.serviceConfig.filter(config => config.type === key);
     return array.pop();
   }
 }

export default ConfigService;
