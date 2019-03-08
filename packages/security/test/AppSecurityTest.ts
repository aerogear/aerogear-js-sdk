import { assert } from "chai";
import mocha, { test } from "mocha";
import * as mockttp from "mockttp";
import { ConfigurationService, MetricsPayload, MetricsBuilder, Metrics, AeroGearConfiguration } from "@aerogear/core";

import { AppSecurity } from "../src";

declare var window: any;
declare var global: any;

global.window = {};
window.device = {};
window.cordova = {};

class MockMetricsBuilder implements MetricsBuilder {
  public payload: MetricsPayload;

  constructor(payload: MetricsPayload) {
    this.payload = payload;
  }

  public getClientId(): string {
    return "";
  }

  public getSavedClientId(): string | null {
    return "";
  }

  public saveClientId(id: string): void {
    return;
  }

  public buildDefaultMetrics(): Metrics[] {
    return [];
  }

  public buildMetricsPayload(type: string, metrics: Metrics[]): Promise<MetricsPayload> {
    return new Promise((resolve, reject) => {
      resolve(this.payload);
    });
  }
}

describe("AppSecurity", () => {

  let testAerogearConfig: AeroGearConfiguration;

  const validMetrics: MetricsPayload = {
    clientId: "123",
    type: "init",
    data: {
      app: {
        appId: "org.aerogear.ionic.showcase",
        appVersion: "0.0.1"
      },
      device: {
        platform: "android",
        platformVersion: "8.0.0"
      }
    }
  };

  const mockServer = mockttp.getLocal();

  before(async () => {
    await mockServer.start();
    await mockServer.post("/api/init").thenReply(204);

    testAerogearConfig = {
      "version": 1.0,
      "clusterName": "192.168.64.74:8443",
      "namespace": "myproject",
      "services": [
        {
          "id": "security",
          "name": "security",
          "type": "security",
          "url": mockServer.url,
          "config": {}
        }
      ]
    };
  });

  after(() => {
    mockServer.stop();
  });

  describe("clientInit", () => {

    it("should return 204 if clientInit POST successful", async () => {
      const configService = new ConfigurationService(testAerogearConfig);
      const appSecurity = new AppSecurity(configService, { metricsBuilder: new MockMetricsBuilder(validMetrics)});
      const res = await appSecurity.clientInit();

      assert.equal(res.status, 204);
    });

  });
});
