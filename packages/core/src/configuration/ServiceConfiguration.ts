interface ServiceConfiguration {

  id: string;
  name: string;
  type: string;
  url: string;
  config: Map<string, string>;

}

export default ServiceConfiguration;
