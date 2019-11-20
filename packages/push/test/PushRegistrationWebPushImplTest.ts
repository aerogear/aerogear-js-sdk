import { assert, expect } from "chai";
import { PushRegistrationWebpushImpl } from "../src/impl";
import { AbstractPushRegistration } from "../src/AbstractPushRegistration";

declare var window: any;
declare var global: any;
declare var btoa: any;
declare var atob: any;

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

  const config = {
    "type": "push",
    "url": "http://www.mocky.io/v2/5a5e4bc53300003b291923eb",
    "config": {
      "web_push": {
        "variantId": "f85015b4-a762-49a7-a36f-34a451f819a4",
        "variantSecret": "978b35d6-7058-43b4-8c37-4dc30022ebda",
        "appServerKey": "BIk8YK3iWC3BfMt3GLEghzY4v5GwaZsTWKxDKm-FZry3Nx2E_q-4VW3501DkQ5TX1Pe7c3yIsajUk9hQAo3sT-0"
      }
    }
  };

  beforeEach(() => {
    global.btoa = () => "dGVzdA==";
    global.atob = (data: string) => "abcdef";
    global.window = { btoa: global.btoa, atob: global.atob };
    global.window.PushNotification = pushMock();
    window.localStorage = storageMock();
    window.device = {
      model: "iPhone XS",
      platform: "iOS",
      version: "11"
    };
    window.Notification = {
      requestPermission: () => "granted"
    };
    window.navigator = {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36"
    };
    window.PushManager = {};

    global.navigator = {
      agent: "Windows",
      serviceWorker: {
        getRegistrations: () => ([{
          // tslint:disable-next-line: no-empty
          unregister: () => { }
        }]),
        register: (worker: string) => ({
          active: { state: "activated" },
          pushManager: {
            subscribe: () => ({
              endpoint: "http://localhost/push",
              getKey: (key: string) => {
                return key === "p256dh" ?
                  new Uint8Array([1, 2, 3, 4]) : new Uint8Array([5, 6, 7, 8]);
              }
            })
          }
        })
      }
    };
  });

  describe("#register", async () => {

    it("should fail because push is not supported", async () => {
      try {
        global.navigator = {};
        window.navigator = {};
        window.PushManager = undefined;
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register();
        assert.fail("This test should fail");
      } catch (error) {
        expect(error.message).equal("Push messages are not supported on the current platform");
      }
    });

    it("should register in push server without any parameter", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register();
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with alias", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register({ alias: "Test" });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with categories", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register({ categories: ["Cordova", "Ionic"] });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should register in push server with alias and categories", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register({ alias: "Test", categories: ["Cordova", "Ionic"] });
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should store the registration data on register", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.register({ alias: "cordova", categories: ["Test"] });

        const storageData = await window.localStorage.getItem(AbstractPushRegistration.REGISTRATION_DATA_KEY);
        const jsonData = JSON.parse(storageData);

        assert.equal(window.localStorage.length, 1);
        assert.equal(jsonData.deviceToken, "dGVzdA==");
        assert.equal(jsonData.alias, "cordova");
        assert.equal(jsonData.categories.length, 1);
        assert.equal(jsonData.deviceType, "Chrome");
        assert.equal(jsonData.operatingSystem, "macOS");
        assert.equal(jsonData.osVersion, "10.14.6");

        expect(jsonData.categories).to.eql(["Test"]);
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should fail because miss variantId", async () => {
      const missVariantIdConfig = {
        "url": "http://www.mocky.io/v2/5a5e4bc53300003b291923eb",
        "config": {
          "ios": {
            "variantSecret": "978b35d6-7058-43b4-8c37-4dc30022ebda"
          }
        }
      };

      try {
        const registration = new PushRegistrationWebpushImpl(missVariantIdConfig);
        await registration.register();
      } catch (_) {
        return;
      }

      expect.fail("should fail because miss variantId");
    });

    it("should fail because miss variantSecret", async () => {
      const missVariantIdConfig = {
        "url": "http://www.mocky.io/v2/5a5e4bc53300003b291923eb",
        "config": {
          "ios": {
            "variantId": "f85015b4-a762-49a7-a36f-34a451f819a4"
          }
        }
      };

      try {
        const registration = new PushRegistrationWebpushImpl(missVariantIdConfig);
        await registration.register();
      } catch (_) {
        return;
      }

      expect.fail("should fail because miss variantId");
    });
  });

  describe("#unregister", async () => {
    it("should unregister in push server", async () => {
      const registrationData = {
        "deviceToken": "dummyDeviceToken",
        "alias": "unitTest",
        "categories": ["test"]
      };
      window.localStorage.setItem(AbstractPushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
      const registration = new PushRegistrationWebpushImpl(config);
      await registration.unregister();
    });

    it("should remove stored registration data on unregister", async () => {
      try {
        const registrationData = {
          "deviceToken": "dummyDeviceToken",
          "alias": "unitTest",
          "categories": ["test"]
        };
        window.localStorage.setItem(AbstractPushRegistration.REGISTRATION_DATA_KEY, JSON.stringify(registrationData));
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.unregister();
        assert.equal(window.localStorage.length, 0);
      } catch (error) {
        assert.fail(error);
      }
    });

    it("should fail to unregister in push server when deviceToken does not exists", async () => {
      try {
        const registration = new PushRegistrationWebpushImpl(config);
        await registration.unregister();
      } catch (_) {
        return;
      }

      expect.fail("should fail to unregister in push server when deviceToken does not exists");
    });
  });
});
