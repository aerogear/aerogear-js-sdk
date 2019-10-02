## JS-SDK 2.7.0

### Push

#### Support WebPush
* WebPush Variants in mobile-services.json are now supported
* Compatible browsers such as Chrome can register for and receive webpush push messages sent from UPS
* Framework for connecting custom service-workers to notification APIs
* Permissions for Notifications are handled by JS-SDK

## JS-SDK 2.6.3

### Push

Support iOS 13

## JS-SDK 2.6.2

### DataSync

Dependency package updates

## JS-SDK 2.6.1

### DataSync

Fixed problem with client conflicting with it's own changes

#### Mobile Security Service 

Fixed problem with obtaining service url


## JS-SDK 2.6.0

### DataSync

#### Support Apollo 2.6.x

Apollo Client 2.6.x with new typings is now supported.

#### Extended conflict support

New conflict implementation requires changes on both client and server.
On server we have changed conflict detection mechanism to single method.
Server side conflict resolution was removed due to the fact that we could not provide
reliable diff source without separate store. 

##### Server side implementation:

```javascript
 const conflictError = conflictHandler.checkForConflict(greeting, args);
      if (conflictError) {
        throw conflictError;
      }
}
```

##### Client side implementation:

Client side implementation now requires users to apply `returnType` to context when performing a mutation.
Conflict interface now has an additional method `mergeOccured` that will be triggered when a conflict was  resolved without data loss.

Please refer to documentation for more details.

#### Breaking changes

##### Cache Helper Interface 

Cache Helper interface now will now accept object instead of individual parameters:

```javascript
 const updateFunction = getUpdateFunction({
            mutationName,
            idField,
            operationType,
            updateQuery
 });
```
##### AuthContext Interface 

Refactored the `` interfaces defined in the `auth` and `sync packages` to accept a map of headers. `token` is no longer required.

### Push

#### Registration:

A bug was fixed with the registration process which made the sdk unable to receive notifications from UPS without using the alias criteria. That problem was fixed and now devices are able to receive notifications using all criteria provided by UPS (variant, alias, category)

The new registration process doesn’t use the [phonegap-push-plugin](https://github.com/phonegap/phonegap-plugin-push)/[Ionic Push](https://ionicframework.com/docs/native/push) anymore. Now all the steps needed to receive push notification are handled by the push JS SDK itself.

```javascript
import { PushRegistration } from "@aerogear/push";

new PushRegistration(new ConfigurationService(config)).register()
.then(() => {
  console.log('Push registration successful');
}).catch((err) => {
  console.error('Push registration unsuccessful ', err);
});
```

#### Unregistration:

We have added an unregister method to the SDK to unregister devices from UPS

```javascript
new PushRegistration(new ConfigurationService(config))
.unregister()
.then(() => {
  console.log('Successfully unregistered');
}).catch((err) => {
  console.error('Error unregistering', err);
});
```

#### Handle notification:

We replaced the Cordova/Ionic notification handler APIs with APIs provided by the push JS SDK:

```javascript
PushRegistration.onMessageReceived((notification: any) => {
  console.log('Received a push notification', notification);
});
```
