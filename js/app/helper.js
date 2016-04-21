(function (angular) {
    'use strict';
    // declare a module
    angular.module('recalotApp')

        /***********************
         *     PROVIDER
         ***********************/
        .factory("helper", function () {
            return {
                sortById: function (a, b) {
                    if (a.id < b.id) return -1;
                    if (a.id > b.id) return 1;
                    return 0
                },
                flatData: function (data) {
                    var result = {};

                    this._flatData(result, '', data);

                    return result;
                },
                _flatData: function(result, prefix, data) {
                    for (var i in data) {
                        if (angular.isObject(data[i])) {
                            this._flatData(result, i + ".", data[i]);
                        } else {
                            result[prefix + i] = data[i];
                        }
                    }
                }
            }
        });
})(window.angular);
