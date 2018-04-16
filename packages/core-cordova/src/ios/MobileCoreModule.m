#import <Cordova/CDVPlugin.h>
#import "MobileCoreModule.h"
@import UIKit;

@implementation MobileCore

- (void) getAppAndDeviceMetrics:(CDVInvokedUrlCommand*)command
{
    NSDictionary *appMetrics = [self getAppMetrics];
    NSDictionary *deviceMetrics = [self getDeviceMetrics];

    NSDictionary *appAndDeviceMetrics = @{
                                          @"app": appMetrics,
                                          @"device": deviceMetrics
                                          };                                      

    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:appAndDeviceMetrics];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (NSDictionary*) getAppMetrics
{
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSDictionary *appMetrics = @{
                                  @"appId": [[NSBundle mainBundle] bundleIdentifier],
                                  @"appVersion": [info objectForKey:@"CFBundleShortVersionString"]
                                  };

    return appMetrics;
}

- (NSDictionary*) getDeviceMetrics
{
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSDictionary *deviceMetrics = @{
                                    @"platform": @"ios",
                                    @"platformVersion": [[UIDevice currentDevice] systemVersion],
                                    @"device": [[UIDevice currentDevice] model]
                                    };

    return deviceMetrics;
}

@end