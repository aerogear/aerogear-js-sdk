import { assert } from "chai";
import { PushRegistration } from "../src";
import { ConfigurationService } from "@aerogear/core";

declare var window: any;
declare var global: any;

global.window = { btoa: () => "dGVzdA==" };
global.window.PushNotification = pushMock();
window.localStorage = storageMock();
window.device = { platform: "iOS" };

function pushMock() {
  return {
    init() {
      return {
        on(key: string, callback: (registrationId: string) => void) {
          callback("dummyDeviceToken");
        }
      };
    }
  };
}

function storageMock() {
  const storage: any = {};

  return {
    setItem(key: string, value: string) {
      storage[key] = value || "";
    },
    getItem(key: string) {
      return key in storage ? storage[key] : null;
    },
    removeItem(key: string) {
      delete storage[key];
    },
    get length() {
      return Object.keys(storage).length;
    }
  };
}

describe("Registration tests", () => {
  const pushConfig = {
    "version": 1,
    "clusterName": "192.168.64.74:8443",
    "namespace": "myproject",
    "clientId": "example_client_id",
    services: [{
      "id": "push",
      "name": "push",
      "type": "push",
      "url": "http://www.mocky.io/v2/5a5e4bc53300003b291923eb",
      "config": {
        "ios": {
          "variantId": "f85015b4-a762-49a7-a36f-34a451f819a4",
          "variantSecret": "978b35d6-7058-43b4-8c37-4dc30022ebda"
        }
      }
    }]
  };
  const config = new ConfigurationService(pushConfig);
  const registration = new PushRegistration(config);

  describe("#register", async () => {
    it("should fail to register in push server", async () => {
      try {
        await registration.register("cordova", ["Test"]);
        assert.fail();
      } catch (_) {
        return "ok";
      }
    });

    it("should register in push server", async function() {
      // in CI environment this test sometimes fails because of the default timeout 2s
      // increase timeout to 10s
      this.timeout(10000);
      try {
        await registration.register("cordova", ["Test"]);
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should store the registration data on register", async function() {
      // in CI environment this test sometimes fails because of the default timeout 2s
      // increase timeout to 10s
      this.timeout(10000);
      try {
        await registration.register("cordova", ["Test"]);
        assert.equal(window.localStorage.length, 1);
      } catch (error) {
        assert.fail(error);
      }
    });
  });

  describe("#unregister", async () => {
    it("should fail to unregister in push server when deviceToken does not exists", async () => {
      try {
        await registration.unregister();
        assert.fail();
      } catch (_) {
        return "ok";
      }
    });

    it("should unregister in push server", async function() {
      // in CI environment this test sometimes fails because of the default timeout 2s
      // increase timeout to 10s
      this.timeout(10000);
      try {
        const registrationData = {
          "deviceToken": "dummyDeviceToken",
          "alias": "unitTest",
          "categories": ["test"]
        };
        window.localStorage.setItem(PushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
        await registration.unregister();
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should remove stored registration data on unregister", async function() {
      // in CI environment this test sometimes fails because of the default timeout 2s
      // increase timeout to 10s
      this.timeout(10000);
      try {
        const registrationData = {
          "deviceToken": "dummyDeviceToken",
          "alias": "unitTest",
          "categories": ["test"]
        };
        window.localStorage.setItem(PushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
        await registration.unregister();
        assert.equal(window.localStorage.length, 0);
      } catch (error) {
        assert.fail(error);
      }
    });
  });
});
