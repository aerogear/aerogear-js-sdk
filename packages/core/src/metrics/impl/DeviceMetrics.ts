 import { Metrics } from '../Metrics';

/**
 * Collect device metrics:
 *
 *  - platform - ios
 *  - platformVersion - version of the ios platform
 *  - device - device name
 */
 export class DeviceMetrics implements Metrics {
  public identifier: string = 'device';
  public collect(): any {
    return {
      'platform': 'js',
      'platformVersion': 1,
      'device': 'TODO - cordova/react wrapper'
    };
  }
 }
