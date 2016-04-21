(function (angular) {
    'use strict';
    // declare a module
    angular.module('recalotApp')

        /***********************
         *     PROVIDER
         ***********************/
        .factory("alertManager", function ($rootScope) {
            var alertManager = {
                success: function (a, b) {
                    this.message("success", a, b);
                },
                error: function (a, b) {
                    this.message("danger", a, b);
                },
                info: function (a, b) {
                    this.message("info", a, b);
                },
                warning: function (a, b) {
                    this.message("warning", a, b);
                },
                message: function (type, message, content) {
                    $rootScope.message = {"label": message, "type": type, content: content};
                },
                clear: function () {
                    $rootScope.message = null;
                }
            };
;
            $rootScope.removeMessage = function(){
                alertManager.clear();
            };

            $rootScope.$on('$routeChangeStart', function(next, current) {
                alertManager.clear();
            });

            return alertManager;

        });
})(window.angular);
