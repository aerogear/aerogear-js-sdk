var exec = require('cordova/exec');

console.log('This message is brought to you by a cordova plugin')

if (!window.aerogear) {
    window.aerogear = {}
}

window.aerogear.myFunc = function (arg0, success, error) {
    exec(success, error, 'CordovaPluginAeroGearMetrics', 'myFunc', [arg0]);
};
