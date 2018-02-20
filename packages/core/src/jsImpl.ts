// Same implementation in javascript
var ConfigLib = function(config){
  this.serviceConfig;
  if(config && config.services){
    this.serviceConfig = config.services;
  }
  return this;
}

ConfigLib.prototype.getKeycloakConfig = function(){
  return this.serviceConfig.filter(function (config) { return config.type = key; });
}

module.exports = ConfigLib
