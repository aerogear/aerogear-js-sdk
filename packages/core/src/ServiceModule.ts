import ServiceConfiguration from "./configuration/ServiceConfiguration";

interface ServiceModule {

  readonly type: string;
  readonly configuration: ServiceConfiguration;

}

export default ServiceModule;
