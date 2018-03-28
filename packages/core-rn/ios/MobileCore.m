
#import "MobileCore.h"
@import UIKit;

@implementation MobileCore

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(getDeviceMetrics:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *deviceMetrics = @{
                                    @"platform": @"ios",
                                    @"platformVersion": [[UIDevice currentDevice] systemVersion],
                                    @"device": [[UIDevice currentDevice] model]
                                    };

    resolve(deviceMetrics);
}

RCT_EXPORT_METHOD(getAppMetrics:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
    NSDictionary *deviceMetrics = @{
                                    @"appId": [[NSBundle mainBundle] bundleIdentifier],
                                    @"appVersion": [info objectForKey:@"CFBundleShortVersionString"]
                                    };

    resolve(deviceMetrics);
}

@end
