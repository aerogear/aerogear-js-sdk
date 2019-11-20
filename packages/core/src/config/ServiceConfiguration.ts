/**
 * Represents the configuration of a single service
 */
export interface ServiceConfiguration<Config = any> {
  readonly url?: string;
  readonly config: Config;
}
