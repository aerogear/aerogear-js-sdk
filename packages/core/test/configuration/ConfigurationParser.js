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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var configuration_1 = require("../../src/configuration");
var mobile_config_json_1 = __importDefault(require("../mobile-config.json"));
describe("ConfigurationParser", function () {
    var aerogearConfig = mobile_config_json_1.default;
    var parser;
    beforeEach(function () {
        parser = new MockConfigurationParser(aerogearConfig);
    });
    describe("#constructor", function () {
        it("should throw if configuration is null", function () {
            var constructor = function () { return new MockConfigurationParser(null); };
            chai_1.expect(constructor).to.throw();
        });
        it("should throw if configuration is undefined", function () {
            var constructor = function () { return new MockConfigurationParser(undefined); };
            chai_1.expect(constructor).to.throw();
        });
        it("should not instantiate null configurations", function () {
            var emptyParser = new MockConfigurationParser({});
            var configurations = emptyParser.getConfigurations();
            chai_1.assert.isArray(configurations);
        });
        it("should instantiate an array of configurations from a mobile-config JSON", function () {
            var services = mobile_config_json_1.default.services;
            var configurations = parser.getConfigurations();
            chai_1.assert.isArray(configurations);
            chai_1.assert.equal(configurations, services);
        });
    });
    describe("#getService", function () {
        it("should return undefined if using an nonexistent key", function () {
            var result = parser.getConfig("foo");
            chai_1.assert.isUndefined(result);
        });
        it("should be able to get keycloak config", function () {
            var keycloakConfig = parser.getConfig("keycloak");
            chai_1.assert.equal(keycloakConfig.name, "keycloak");
        });
        it("should be able to get metrics config", function () {
            var metricsConfig = parser.getConfig("metrics");
            chai_1.assert.equal(metricsConfig.name, "metrics");
        });
    });
    var MockConfigurationParser = /** @class */ (function (_super) {
        __extends(MockConfigurationParser, _super);
        function MockConfigurationParser() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MockConfigurationParser.prototype.getConfigurations = function () {
            return this.configurations;
        };
        return MockConfigurationParser;
    }(configuration_1.ConfigurationParser));
});
//# sourceMappingURL=ConfigurationParser.js.map