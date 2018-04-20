"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sinon_1 = __importDefault(require("sinon"));
var configuration_1 = require("../../src/configuration");
var metrics_1 = require("../../src/metrics");
var mobile_config_json_1 = __importDefault(require("../mobile-config.json"));
describe("MetricsService", function () {
    var metricsConfig = new configuration_1.ConfigurationParser(mobile_config_json_1.default).getConfig("metrics");
    var storage = { clientId: null };
    var metricsService;
    beforeEach(function () {
        metricsService = new MockMetricsService(metricsConfig);
        storage.clientId = null;
    });
    describe("#constructor", function () {
        it("should have a NetworkMetricsPublisher by default", function () {
            var defaultPublisher = metricsService.metricsPublisher;
            chai_1.expect(defaultPublisher).to.be.instanceOf(metrics_1.NetworkMetricsPublisher);
        });
        it("should instantiate NetworkMetricsPublisher with configuration url", function () {
            var url = metricsConfig.url;
            var publisher = metricsService.metricsPublisher;
            chai_1.assert.equal(url, publisher.url);
        });
    });
    describe("#setPublisher", function () {
        it("should be possible to override the publisher", function () { return __awaiter(_this, void 0, void 0, function () {
            var customPublisher, spy, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        customPublisher = new MockMetricsPublisher();
                        spy = sinon_1.default.spy(customPublisher, "publish");
                        metricsService.metricsPublisher = customPublisher;
                        return [4 /*yield*/, metricsService.publish("init", [])];
                    case 1:
                        res = _a.sent();
                        sinon_1.default.assert.calledOnce(spy);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("#publish", function () {
        it("should publish a MetricsPayload from an array of Metrics", function () { return __awaiter(_this, void 0, void 0, function () {
            var mockPublisher, spy, type, metrics, matcher;
            return __generator(this, function (_a) {
                mockPublisher = new MockMetricsPublisher();
                spy = sinon_1.default.spy(mockPublisher, "publish");
                metricsService.metricsPublisher = mockPublisher;
                type = "init";
                metrics = [
                    { identifier: "someNumber", collect: function () { return 123; } },
                    { identifier: "someString", collect: function () { return "foo"; } }
                ];
                matcher = {
                    clientId: metricsService.getClientId(),
                    type: type,
                    data: {
                        someNumber: 123,
                        someString: "foo"
                    }
                };
                metricsService.publish(type, metrics);
                sinon_1.default.assert.calledWithMatch(spy, matcher);
                return [2 /*return*/];
            });
        }); });
        it("should throw an error is type is null", function () {
            var test = function () { return metricsService.publish(null, []); };
            chai_1.expect(test).to.throw("Type is invalid: null");
        });
        it("should throw an error is type is undefined", function () {
            var test = function () { return metricsService.publish(undefined, []); };
            chai_1.expect(test).to.throw("Type is invalid: undefined");
        });
    });
    describe("#getClientId", function () {
        it("should generate a string client id", function () {
            var id = metricsService.getClientId();
            chai_1.assert.isString(id);
        });
        it("should save the client id when getting for first time", function () {
            chai_1.assert.isNull(storage.clientId);
            var id = metricsService.getClientId();
            chai_1.assert.equal(storage.clientId, id);
        });
        it("should generate a new unique clientID if none is saved", function () {
            var id = metricsService.getClientId();
            // Remove id from storage, as if it was a different device
            storage.clientId = null;
            var newId = metricsService.getClientId();
            chai_1.assert.notEqual(id, newId);
        });
        it("should return the same clientID after the first time", function () {
            var id = metricsService.getClientId();
            var newId = metricsService.getClientId();
            chai_1.assert.equal(id, newId);
        });
    });
    var MockMetricsService = /** @class */ (function (_super) {
        __extends(MockMetricsService, _super);
        function MockMetricsService() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockMetricsService.prototype.sendAppAndDeviceMetrics = function () {
            return null;
        };
        // Mocked
        MockMetricsService.prototype.getSavedClientId = function () {
            return storage.clientId;
        };
        // Mocked
        MockMetricsService.prototype.saveClientId = function (id) {
            storage.clientId = id;
        };
        return MockMetricsService;
    }(metrics_1.MetricsService));
    var MockMetricsPublisher = /** @class */ (function () {
        function MockMetricsPublisher() {
        }
        MockMetricsPublisher.prototype.publish = function (metrics) {
            return new Promise(function (resolve) { return resolve({ statusCode: 204 }); });
        };
        return MockMetricsPublisher;
    }());
});
//# sourceMappingURL=MetricsService.js.map