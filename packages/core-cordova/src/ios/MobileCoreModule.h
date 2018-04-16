#import <Cordova/CDV.h>

@interface MobileCore : CDVPlugin

- (void)getAppAndDeviceMetrics:(CDVInvokedUrlCommand*)command;

@end