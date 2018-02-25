import { isCordovaApp, isReactNative } from './PlatformHelpers';

// [Investigation] Detecting platforms on runtime.

// Welcome to TypeScript hacks
declare var device: any;
// Welcome to TypeScript hacks
declare var Platform: any;

/**
 * Get device platform
 */
export function getPlatform(): string {
    if (isCordovaApp) {
      // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device/
      return device.platform;
    } else if (isReactNative) {
      return Platform.OS;
    }
    return 'Unknown';
}
