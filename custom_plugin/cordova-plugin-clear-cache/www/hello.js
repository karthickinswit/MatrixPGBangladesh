/*global cordova, module*/

module.exports = {
    clearCache: function (name, successCallback, errorCallback) {
        cordova.exec(successCallback, errorCallback, "Hello", "clearCache", [name]);
    }
};
