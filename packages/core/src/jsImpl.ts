// Same implementation in javascript
var ConfigLib = function(config){
  this.serviceConfig;
  if(config && config.services){
    this.serviceConfig = config.services;
  }
  return this;
}

ConfigLib.prototype.getKeycloakConfig = function(){
      return this.serviceConfig.filter(config => config.type = 'keycloak');
}

module.exports = ConfigLib
