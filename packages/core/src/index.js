"use strict";
/**
 * @module @aerogearservices/core
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Config = /** @class */ (function () {
    /**
     * @param config - any type of configuration that will be send from server.
     * It's not possible easy/worth to wrap that to types. Even native implementations do not do that.
     */
    function Config(config) {
        this.serviceConfig = [];
        if (config && config.services) {
            this.serviceConfig = config.services;
        }
    }
    Config.prototype.getKeycloakConfig = function () {
        return this.configByKey('keycloak');
    };
    Config.prototype.getMetricsConfig = function () {
        return this.configByKey('metrics');
    };
    Config.prototype.configByKey = function (key) {
        return this.serviceConfig.filter(function (config) { return config.type = key; });
    };
    return Config;
}());
exports.Config = Config;
exports.default = Config;
//# sourceMappingURL=index.js.map