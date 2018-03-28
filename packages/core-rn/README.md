
# React Native SDK for Aerogear

This is just a POC at the moment.

This package can be installed directly in a React Native project, allowing the JS SDK access native features of Android and iOS. The main idea of this POC is to prove that only one package has to be installed by the user, instead of both js-sdk and the native module.

## Getting started

`$ npm install @aerogearservices/core-rn --save`

### Mostly automatic installation

This step is usually enough

`$ react-native link @aerogearservices/core-rn`

### Manual installation

In case automatic installation didn't work

<details><summary>iOS</summary>
<p>

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `@aerogearservices/core-rn` and add `MobileCore.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libMobileCore.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

</p>
</details>

<details><summary>Android</summary>
<p>

1. Open up `android/app/src/main/java/[...]/MainActivity.java`
  - Add `import com.reactlibrary.MobileCorePackage;` to the imports at the top of the file
  - Add `new MobileCorePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':@aerogearservices/core-rn'
  	project(':@aerogearservices/core-rn').projectDir = new File(rootProject.projectDir, 	'../node_modules/@aerogearservices/core-rn/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':@aerogearservices/core-rn')
  	```

</p>
</details>

## Usage

Import the desired module and instantiate, passing the necessary configuration parameters:

```javascript
import { RNMetricsService } from "@aerogearservices/core-rn";
import React, { Component } from "react";

class MyComponent extends Component {

  componentWillMount() {
    const metricsService = new RNMetricsService({
      url: "http://your-metrics-service/metrics" 
    });
	
    metricsService.sendAppAndDeviceMetrics()
      .then(() => this.handleSuccess())
      .catch(err => this.handleError(err));
  }

  render() {
    ...
  }

}

```
  
