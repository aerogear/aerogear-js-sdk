import { assert, expect } from "chai";
import { PushRegistration } from "../src";
import { ConfigurationService } from "@aerogear/core";

declare var window: any;
declare var global: any;

function pushMock() {
  return {
    init() {
      return {
        on(key: string, callback: (data: any) => void) {
          callback({ "registrationId": "dummyDeviceToken" });
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

describe("Push", () => {

  const validConfig = {
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

  const config = new ConfigurationService(validConfig);

  beforeEach(() =>  {
    global.window = { btoa: () => "dGVzdA==" };
    global.window.PushNotification = pushMock();
    window.localStorage = storageMock();
    window.device = {
      model: "iPhone XS",
      platform: "iOS",
      version: "11"
    };
  });

  describe("#register", async () => {
    it("should register in push server without any parameter", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.register();
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with alias", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.register({ alias: "Test" });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with categories", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.register({ categories: ["Cordova", "Ionic"] });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with alias and categories", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.register({ alias: "Test", categories: ["Cordova", "Ionic"] });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should store the registration data on register", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.register({ alias: "cordova", categories: ["Test"] });

        const storageData = await window.localStorage.getItem(PushRegistration.REGISTRATION_DATA_KEY);
        const jsonData = JSON.parse(storageData);

        assert.equal(window.localStorage.length, 1);
        assert.equal(jsonData.deviceToken, "dummyDeviceToken");
        assert.equal(jsonData.alias, "cordova");
        assert.equal(jsonData.categories.length, 1);
        assert.equal(jsonData.deviceType, "iPhone XS");
        assert.equal(jsonData.operatingSystem, "iOS");
        assert.equal(jsonData.osVersion, "11");

        expect(jsonData.categories).to.eql(["Test"]);
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should fail because cordova push plugin is miss", async () => {
      // Simulate push plugin not installed
      global.window.PushNotification = undefined;

      try {
        const registration = new PushRegistration(config);
        await registration.register({alias: "cordova", categories: ["Test"]});
      } catch (_) {
        return;
      }

      expect.fail("should fail because cordova push plugin is miss");
    });

    it("should fail because miss push configuration", async () => {
      const missPushServiceConfig = {
        "version": 1,
        "clusterName": "192.168.64.74:8443",
        "namespace": "myproject",
        "clientId": "example_client_id"
      };

      try {
        const registration = new PushRegistration(new ConfigurationService(missPushServiceConfig));
        await registration.register();
      } catch (_) {
        return;
      }

      expect.fail("should fail because miss push configuration");
    });

    it("should fail because miss variantId", async () => {
      const missVariantIdConfig = {
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
              "variantSecret": "978b35d6-7058-43b4-8c37-4dc30022ebda"
            }
          }
        }]
      };

      try {
        const registration = new PushRegistration(new ConfigurationService(missVariantIdConfig));
        await registration.register();
      } catch (_) {
        return;
      }

      expect.fail("should fail because miss variantId");
    });

    it("should fail because miss variantSecret", async () => {
      const missVariantIdConfig = {
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
              "variantId": "f85015b4-a762-49a7-a36f-34a451f819a4"
            }
          }
        }]
      };

      try {
        const registration = new PushRegistration(new ConfigurationService(missVariantIdConfig));
        await registration.register();
      } catch (_) {
        return;
      }

      expect.fail("should fail because miss variantId");
    });
  });

  describe("#unregister", async () => {
    it("should unregister in push server", async () => {
      try {
        const registrationData = {
          "deviceToken": "dummyDeviceToken",
          "alias": "unitTest",
          "categories": ["test"]
        };
        window.localStorage.setItem(PushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
        const registration = new PushRegistration(config);
        await registration.unregister();
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should remove stored registration data on unregister", async () => {
      try {
        const registrationData = {
          "deviceToken": "dummyDeviceToken",
          "alias": "unitTest",
          "categories": ["test"]
        };
        window.localStorage.setItem(PushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
        const registration = new PushRegistration(config);
        await registration.unregister();
        assert.equal(window.localStorage.length, 0);
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should fail to unregister in push server when deviceToken does not exists", async () => {
      try {
        const registration = new PushRegistration(config);
        await registration.unregister();
      } catch (_) {
        return;
      }

      expect.fail("should fail to unregister in push server when deviceToken does not exists");
    });
  });
});
