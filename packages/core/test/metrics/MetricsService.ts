import { assert, expect } from "chai";
import mocha from "mocha";
import sinon from "sinon";
import uuid from "uuid/v1";
import { ConfigurationParser, ServiceConfiguration } from "../../src/configuration";
import {
  Metrics,
  MetricsPayload,
  MetricsPublisher,
  MetricsService,
  NetworkMetricsPublisher
} from "../../src/metrics";
import testAerogearConfig from "../mobile-config.json";

describe("MetricsService", () => {

  const metricsConfig = new ConfigurationParser(testAerogearConfig).getConfig("metrics");
  const storage = { clientId: null };

  let metricsService: MetricsService;

  beforeEach(() => {
    metricsService = new MockMetricsService(metricsConfig);
    storage.clientId = null;
  });

  it("should have a NetworkMetricsPublisher by default", () => {
    const defaultPublisher = metricsService.metricsPublisher;

    expect(defaultPublisher).to.be.instanceOf(NetworkMetricsPublisher);
  });

  it("should instantiate NetworkMetricsPublisher with configuration url", () => {
    const { url } = metricsConfig;
    const publisher = metricsService.metricsPublisher as NetworkMetricsPublisher;

    assert.equal(url, publisher.url);
  });

  it("should be possible to override the publisher", async () => {
    const customPublisher = new MockMetricsPublisher();
    const spy = sinon.spy(customPublisher, "publish");
    metricsService.metricsPublisher = customPublisher;

    const res = await metricsService.publish([]);

    sinon.assert.calledOnce(spy);
  });

  it("should publish a MetricsPayload from an array of Metrics", async () => {
    const mockPublisher = new MockMetricsPublisher();
    const spy = sinon.spy(mockPublisher, "publish");
    metricsService.metricsPublisher = mockPublisher;

    const metrics: Metrics[] = [
      { identifier: "someNumber", collect: () => 123 },
      { identifier: "someString", collect: () => "foo" }
    ];

    metricsService.publish(metrics);

    const matcher: MetricsPayload = {
      clientId: metricsService.getClientId(),
      data: {
        someNumber: 123,
        someString: "foo"
      }
    };

    sinon.assert.calledWithMatch(spy, matcher);
  });

  it("should generate a string client id", () => {
    const id = metricsService.getClientId();

    assert.isString(id);
  });

  it("should save the client id when getting for first time", () => {
    assert.isNull(storage.clientId);
    const id = metricsService.getClientId();

    assert.equal(storage.clientId, id);
  });

  it("should generate a new unique clientID if none is saved", () => {
    const id = metricsService.getClientId();
    // Remove id from storage, as if it was a different device
    storage.clientId = null;
    const newId = metricsService.getClientId();

    assert.notEqual(id, newId);
  });

  it("should return the same clientID after the first time", () => {
    const id = metricsService.getClientId();
    const newId = metricsService.getClientId();

    assert.equal(id, newId);
  });

  class MockMetricsService extends MetricsService {

    public sendAppAndDeviceMetrics(): Promise<any> {
      return null;
    }

    // Mocked
    protected getSavedClientId(): string {
      return storage.clientId;
    }

    // Mocked
    protected saveClientId(id: string): void {
      storage.clientId = id;
    }

  }

  class MockMetricsPublisher implements MetricsPublisher {

    public publish(metrics: MetricsPayload): Promise<any> {
      return new Promise(resolve => resolve({ statusCode: 204 }));
    }
  }

});
