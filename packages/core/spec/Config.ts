import { expect } from "chai";
import sinon from "sinon";
import { ConfigService } from "../src/Config";

describe("ConfigService Tests", () => {
  const testConfig = require("./mobile-config.json");
  let testSubject: ConfigService;

  beforeEach(() => {
    testSubject = new ConfigService(testConfig);
  });

  it("should be able to get keycloak config", () => {
    const keycloakConfig = testSubject.getKeycloakConfig();
    expect(keycloakConfig.name).to.equal("keycloak");
  });

  it("should be able to get metrics config", () => {
    const metricsConfig = testSubject.getMetricsConfig();
    expect(metricsConfig.name).to.equal("metrics");
  });

});
