
cordova.define("cordova/plugin/home", function(require, exports, module) {
    
    var exec = require('cordova/exec');
    
    var Home = function() {};

    Home.prototype.clearCache = function(successCallback, errorCallback) {
        return exec(successCallback,
                            errorCallback,
                            'Home',
                            'clearCache',
                            []);
    };
    
    var home = new Home();
    module.exports = home;
});