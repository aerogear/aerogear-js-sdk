import {Metrics} from '../Metrics';

/**
 * Collect application metrics:
 *
 *  - appId - application bundle id
 *  - appVersion - version of the application
 *  - sdkVersion - AeroGear Services SDK version
 */
export class AppMetrics implements Metrics {
  public identifier: string = 'app';
  public collect(): any {
    // TODO - does this even make sense to collect
    const data: any = {
      'appId': 1,
      'appVersion': 1,
      'sdkVersion': 1
    };
    return data;
  }
}
