import { assert } from "chai";
import mocha from "mocha";
import * as mockttp from "mockttp";
import {
  MetricsPayload,
  NetworkMetricsPublisher
} from "../../../src/metrics";
import testAerogearConfig from "../../mobile-config.json";

describe("NetworkMetricsPublisher", () => {

  const validMetrics: MetricsPayload = {
    clientId: "123",
    type: "init",
    data: {}
  };

  const mockServer = mockttp.getLocal();
  let publisher: NetworkMetricsPublisher;

  before(async () => {
    await mockServer.start();
    await mockServer.post("/test").thenReply(204);

    publisher = new NetworkMetricsPublisher(mockServer.url + "/test");
  });

  after(() => {
    mockServer.stop();
  });

  describe("#publish", () => {

    it("should return 204 if metrics are published", async () => {
      const res = await publisher.publish(validMetrics);

      assert.equal(res.status, 204);
    });

  });

});
