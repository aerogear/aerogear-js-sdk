import { expect } from "chai";
import mocha from "mocha";
import { ConfigurationParser, ServiceConfiguration } from "../../src/configuration";
import testAerogearConfig from "../mobile-config.json";

describe("ConfigurationParser", () => {

  let testSubject: ConfigurationParser;

  beforeEach(() => {
    testSubject = new ConfigurationParser(testAerogearConfig);
  });

  });

  describe("#getService", () => {

    it("should be able to get keycloak config", () => {
      const keycloakConfig = parser.getConfig("keycloak");

      assert.equal(keycloakConfig.name, "keycloak");
    });

    it("should be able to get metrics config", () => {
      const metricsConfig = parser.getConfig("metrics");

      assert.equal(metricsConfig.name, "metrics");
    });

  });

});
