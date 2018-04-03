import chai, { expect } from "chai";
import sinon from "sinon";
import mocha from "mocha";
import { find } from "lodash";
import ServiceConfiguration from "../../src/configuration/ServiceConfiguration";
import testMobileConfig from "./mobile-config.json";

describe("ServiceConfiguration", () => {

  it("should be able to get metrics config", () => {
    const metricsConfig: ServiceConfiguration = find(testMobileConfig.services, { type: "metrics" });

    expect(metricsConfig.name).to.equal("metrics");
  });

});
