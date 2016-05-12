(function (angular) {
    'use strict';
    // declare a module
    var module = angular.module('recalotApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap']);

    /***********************
     *     ROUTES
     ***********************/
    module.config(function ($routeProvider) {
            $routeProvider
            // route for the home page
                .when('/', {
                    templateUrl: 'views/pages/home.html'
                })
                .when('/:prefixId', {
                    templateUrl: 'views/pages/start.html',
                    controller: "startCtrl"
                })
                .when('/:prefixId/:contentId', {
                    templateUrl: 'views/pages/start.html',
                    controller: "startCtrl"
                })
                .when('/:prefixId/:contentId/:instanceId', {
                    templateUrl: 'views/pages/start.html',
                    controller: "startCtrl"
                })
                .when('/:prefixId/:contentId/:typeId/:instanceId', {
                    templateUrl: 'views/pages/start.html',
                    controller: "startCtrl"
                })
        })

        /***********************
         *     DIRECTIVES
         ***********************/
        .directive("myFooter", function () {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "views/frame/footer.html",
                controller: "footerCtrl"
            };
        })
        .directive("navTop", function () {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "views/frame/topNav.html",
                controller: "topNavCtrl"
            };
        })
        .directive("navMain", function () {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "views/frame/mainNav.html"
            };
        })
        .directive("smallList", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    type: "@",
                    state: "@",
                    label: "@",
                    columns: "@"

                },
                templateUrl: "views/snippet/smallList.html",
                controller: "smallListCtrl"
            }
        })
        .directive("mediumList", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    type: "@",
                    state: "@",
                    label: "@",
                    columns: "@"

                },
                templateUrl: "views/snippet/mediumList.html",
                controller: "smallListCtrl"
            }
        })
        .directive("detailWindow", function () {
            return {
                restrict: "E",
                replace: true,
                scope: {
                    type: "@",
                    state: "@"
                },
                templateUrl: "views/snippet/detailWindow.html",
                controller: "detailWindowCtrl"
            };
        })
        .directive("experimentsTable", function () {
            return {
                restrict: "E",
                replace: true,
                templateUrl: "views/snippet/experimentsTable.html",
                controller: "experimentsTableCtrl"
            }
        })

        /***********************
         *     CONTROLLER
         ***********************/
        .controller("startCtrl", function ($scope, $rootScope, $routeParams) {
            console.log($routeParams);

            $scope.config = {
                template: "views/pages/" + $routeParams.prefixId + "/" + ($routeParams.contentId != null ? $routeParams.contentId : "index")  + ($routeParams.typeId != null ? ("/" + $routeParams.typeId) : "") + ".html",
            };

            $rootScope.setActiveById($routeParams.prefixId);
        })
        .controller("overviewCtrl", function ($scope, $location, $rootScope, $routeParams, helper) {
            var page = ($routeParams.instanceId != null ? parseInt($routeParams.instanceId, 10) : 1);

            $scope.overviewTemplate = 'views/pages/experiments/snippets/overview/' + page + '.html';

            $rootScope.overview = {};

            $rootScope.overview.hosts = $rootScope.hosts.history;

            $rootScope.overview.activeHosts = [];
            if ($routeParams.hosts != null) {
                $rootScope.overview.activeHosts = $routeParams.hosts.split(",");
            }

            for (var i in $scope.overview.hosts) {
                $rootScope.overview.hosts[i].state = $rootScope.overview.activeHosts.indexOf($rootScope.overview.hosts[i].label) > -1 ? "success" : "";
            }

            $rootScope.overview.toggleHost = function (host) {
                if (host.state == "success") {
                    host.state = "";
                    var index = $rootScope.overview.activeHosts.indexOf(host.label);
                    if (index > -1) {
                        $rootScope.overview.activeHosts.splice(index, 1);
                    }

                } else {
                    host.state = "success";
                    $rootScope.overview.activeHosts.push(host.label);
                }
            };


            $rootScope.overview.toggleSource = function (item) {
                if (item.length > 0) {
                    var active = item[0].state == "success";

                    for (var i in item) {
                        item[i].state = active ? '' : 'success';
                    }

                    localStorage.setItem("overview.experiments", JSON.stringify($scope.overview.experiments));
                }
            };

            $rootScope.overview.toggleExp = function (item) {
                var active = item.state == "success";
                item.state = active ? '' : 'success';

                localStorage.setItem("overview.experiments", JSON.stringify($scope.overview.experiments));
            };

            if (page == 2 && $rootScope.overview.activeHosts.length > 0) {

                $scope.overview.experiments = {};

                localStorage.removeItem("overview.experiments");

                for (var i in $rootScope.overview.hosts) {
                    if ($rootScope.overview.hosts[i].state == "success") {
                        helper.getData($scope.overview.experiments, $rootScope.overview.hosts[i].label, $rootScope.overview.hosts[i].host, $rootScope.requests["experiments"]["get"]["finished"]);
                    }
                }
            } else if (page == 3) {
                $scope.overview.experiments = JSON.parse(localStorage.getItem("overview.experiments"));
            }

            $rootScope.overview.nextPage = function () {
                $location.url("/" + $routeParams.prefixId + "/" + $routeParams.contentId + "/" + (++page) + "?hosts=" + $rootScope.overview.activeHosts.join(","));
            };

            $rootScope.overview.prevPage = function () {
                $location.url("/" + $routeParams.prefixId + "/" + $routeParams.contentId + "/" + (--page) + "?hosts=" + $rootScope.overview.activeHosts.join(","));
            };
        })
        .controller("experimentCreateCtrl", function ($scope, $rootScope, $http, $routeParams, helper, alertManager) {
            $scope.experimentTemplate = 'views/pages/experiments/snippets/' + $routeParams.instanceId + '.html';

            $scope.createExperiments = function (data) {
                try {
                    var d = JSON.parse(data);

                    if (!angular.isArray(d)) {
                        $scope.creation = {"experiments": [d]};
                    } else {
                        $scope.creation = {"experiments": d};
                    }

                    if ($rootScope.requests["experiments"] != null && $rootScope.requests["experiments"]["put"] != null && $rootScope.requests["experiments"]["put"]["item"] != null) {
                        var url = $rootScope.requests.host + $rootScope.requests["experiments"]["put"]["item"];

                        for (var i in $scope.creation.experiments) {
                            var item = $scope.creation.experiments[i];
                            item.state = 'waiting';
                            item.message = '';
                            $http({
                                method: 'PUT',
                                url: url,
                                config: i,
                                data: $.param(helper.flatData(item)),
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                            }).then(function successCallback(response) {
                                console.log(response);
                                $scope.creation.experiments[response.config.config].state = "success";
                                $scope.creation.experiments[response.config.config].message = response.data.message;
                            }, function errorCallback(response) {
                                $scope.creation.experiments[response.config.config].message = response.data.message;
                                $scope.creation.experiments[response.config.config].state = "danger";
                            });
                        }

                    }


                } catch (e) {
                    return alertManager.error(e.toString());
                }
            };

            $http.get("data/experimentConfig.json").then(function (data) {
                $scope.experimentConfig = data.data;
            });

        })
        .controller("smallListCtrl", function ($rootScope, $scope, $http, $location, $routeParams, storageManager, helper, alertManager) {

            $scope.$routeParams = $routeParams;


            function load(){
                if ($scope.type != null && $scope.state != null) {
                    if ($rootScope.requests != null && $rootScope.requests[$scope.type] != null && $rootScope.requests[$scope.type]["get"] != null && $rootScope.requests[$scope.type]["get"][$scope.state] != null) {
                        $scope.items = storageManager.get($rootScope.requests.host + $scope.type + "get" + $scope.state);
                        $scope.readOnly = $rootScope.requests[$scope.type]["delete"] == undefined || $rootScope.requests[$scope.type]["delete"][$scope.state] == undefined;
                        $scope.listIsLoading = true;

                        $http.get($rootScope.requests.host + $rootScope.requests[$scope.type]["get"][$scope.state]).then(
                            function successCallback(data) {
                                data.data.sort(helper.sortById);

                                if (!storageManager.equal($rootScope.requests.host + $scope.type + "get" + $scope.state, data.data)) {
                                    $scope.items = data.data;
                                    $scope.items.sort(helper.sortById);

                                    storageManager.put($rootScope.requests.host + $scope.type + "get" + $scope.state, $scope.items);
                                }

                                $scope.navigateTo = function (item) {
                                    $location.url("/" + $routeParams.prefixId + "/" + $routeParams.contentId + "/" + item.id);
                                }

                                Sortable.init()

                                $scope.listIsLoading = false;
                            }, function errorCallback(response) {
                                alertManager.error("Ooops. Something went wrong! The server might not be available!", response);
                            });
                    }
                }
            }

            load();

            $scope.refresh = function(){
                load();
            }
        })
        .controller("footerCtrl", function ($scope, $http) {
            $scope.footer = {};

            if (localStorage.getItem("footer") !== null) {
                $scope.footer = JSON.parse(localStorage.getItem("footer"));
            }

            $http.get("data/footer.json").then(function (data) {
                $scope.footer = data.data;
                localStorage.setItem("footer", JSON.stringify(data.data));
            });
        })
        .controller("detailWindowCtrl", function ($scope, $rootScope, $http, $routeParams, storageManager, alertManager) {
            $scope.isArray = angular.isArray;
            $scope.isObject = angular.isObject;


            $scope.performAction = function (item, type) {
                if (type == 'add') {
                    $scope.formData = {};

                    if (item != null && item.content != null && item.content.configuration != null) {
                        for (var i in item.content.configuration) {
                            var c = item.content.configuration[i];
                            $scope.formData[c.key] = c.value;
                        }
                    }

                    $scope.showForm = true;
                } else if (type == 'send') {
                    if ($rootScope.requests[$scope.type]["put"] != null && $rootScope.requests[$scope.type]["put"][$routeParams.contentId] != null) {
                        var url = $rootScope.requests.host + $rootScope.requests[$scope.type]["put"][$routeParams.contentId];

                        $http({
                            method: 'PUT',
                            url: url,
                            data: $.param(item),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).then(function successCallback(response) {
                            alertManager.success("The request was successful!", response);
                        }, function errorCallback(response) {
                            alertManager.error("Ooops. Something went wrong!", response);
                        });
                    }
                } else if (type == 'delete') {
                    if ($rootScope.requests[$scope.type]["delete"] != null && $rootScope.requests[$scope.type]["delete"][$routeParams.contentId] != null) {
                        var url = $rootScope.requests.host + $rootScope.requests[$scope.type]["delete"][$routeParams.contentId] + item;

                        $http({
                            method: 'DELETE',
                            url: url,
                            data: $.param(item),
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                        }).then(function successCallback(response) {
                            alertManager.success("The request was successful!", response);
                        }, function errorCallback(response) {
                            alertManager.error("Ooops. Something went wrong!", response);
                        });
                    }
                } else if (type == 'refresh') {
                    $rootScope.setDetailData(item);
                }
            }

            $rootScope.setDetailData = function (itemId) {
                $scope.detail = storageManager.get($rootScope.requests.host + $scope.type + "get" + $scope.state + itemId);

                $scope.detailIsloading = true;

                $http.get($rootScope.requests.host + $rootScope.requests[$scope.type]["get"][$scope.state] + itemId).then(
                    function successCallback(data) {
                        var detail = {
                            "label": data.data.id,
                            "content": data.data
                        };


                        if (!storageManager.equal($rootScope.requests.host + $scope.type + "get" + $scope.state + itemId, detail)) {
                            $scope.detail = detail;
                        }

                        $scope.detailIsloading = false;

                        storageManager.put($rootScope.requests.host + $scope.type + "get" + $scope.state + itemId, $scope.detail);
                    }, function errorCallback(response) {
                        alertManager.error("Ooops. Something went wrong! The server might not be available!", response);
                    }
                );

                $scope.canCreate = $rootScope.requests[$scope.type]["put"] != null && $rootScope.requests[$scope.type]["put"][$routeParams.contentId] != null;
                $scope.canDelete = $rootScope.requests[$scope.type]["delete"] != null && $rootScope.requests[$scope.type]["delete"][$routeParams.contentId] != null;
            };

            if ($routeParams.instanceId != null) {
                $rootScope.setDetailData($routeParams.instanceId);
            }

        })
        .controller("experimentsTableCtrl", function ($scope, $rootScope, $http, $routeParams) {
            function contains(a, obj) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i] === obj) {
                        return true;
                    }
                }
                return false;
            }

            function getExperiments(host, experimentIds, $scope) {
                $scope.sources = {};
                for (var i in experimentIds) {
                    var id = experimentIds[i];

                    $http.get(host.host + $rootScope.requests["experiments"]["get"]["item"] + id).then(function (data) {

                        var exp = data.data;

                        if ($scope.sources[exp.dataSourceId] == undefined) {
                            $scope.sources[exp.dataSourceId] = {
                                "name": exp.dataSourceId,
                                "metrics": [],
                                algorithms: []
                            };
                        }

                        //fetch metrics
                        for (var n in exp.results) {
                            var result = exp.results[n];

                            for (var m in result) {
                                if (!contains($scope.sources[exp.dataSourceId].metrics, m)) {
                                    $scope.sources[exp.dataSourceId].metrics.push(m);
                                }
                            }
                        }

                        //insert results
                        for (var n in exp.results) {
                            var result = exp.results[n];

                            var r = [];
                            for (var mi in $scope.sources[exp.dataSourceId].metrics) {
                                var m = $scope.sources[exp.dataSourceId].metrics[mi];

                                if (result[m] != undefined) {
                                    r.push(result[m]);
                                } else {
                                    r.push(" - ");
                                }
                            }

                            $scope.sources[exp.dataSourceId].algorithms.push({
                                "name": n,
                                "results": r
                            })
                        }

                        Sortable.init()
                    });
                }
            }

            var experiments = JSON.parse(localStorage.getItem("overview.experiments"));

            if ($routeParams.experimentIds != null && $routeParams.experimentIds.length > 0) {
                getExperiments($rootScope.requests.host, $routeParams.experimentIds.split(","), $scope);
            } else if (experiments != null) {

                for (var hostLabel in experiments) {
                    var host = null;
                    for (var i in $rootScope.hosts.history) {
                        if ($rootScope.hosts.history[i].label == hostLabel) {
                            host = $rootScope.hosts.history[i];
                            break;
                        }
                    }

                    if (host != null) {
                        var ids = [];
                        for (var i in experiments[hostLabel]) {
                            var exp = experiments[hostLabel][i];
                            if (exp.state == "success") {
                                ids.push(exp.id);
                            }
                        }

                        getExperiments(host, ids, $scope);
                    }
                }
            } else {
                $http.get($rootScope.requests.host + $rootScope.requests["experiments"]["get"]["finished"]).then(function (data) {
                    var ids = [];
                    for (var i in data.data) {
                        var exp = data.data[i];
                        ids.push(exp.id);
                    }

                    getExperiments($rootScope.requests.host, ids, $scope);
                });

            }
        })
        .controller("topNavCtrl", function ($rootScope, $route, $http, $routeParams) {
            $rootScope.navigation = {};
            $rootScope.requests = {};

            $rootScope.setActiveById = function (prefixId) {
                for (var i in  $rootScope.navigation.items) {
                    $rootScope.navigation.items[i].active = false;
                    if ($rootScope.navigation.items[i].link != null) {
                        if ($rootScope.navigation.items[i].link == prefixId) {

                            $rootScope.setActive($rootScope.navigation.items[i]);
                            break;
                        }
                    }
                }
            }


            if (localStorage.getItem("requests") !== null) {
                $rootScope.requests = JSON.parse(localStorage.getItem("requests"));
            }

            $rootScope.setHost = function (host) {
                if (host != null) {
                    $rootScope.hosts.active = host;
                    $rootScope.requests.host = host.host;

                    localStorage.setItem("hosts", JSON.stringify($rootScope.hosts));

                    $route.reload();
                }
            };

            $rootScope.addHost = function (host) {
                if (host != null) {
                    $rootScope.hosts.history.push(host);
                    $rootScope.hosts.add = null;
                    localStorage.setItem("hosts", JSON.stringify($rootScope.hosts));
                    $route.reload();
                }
            };

            $rootScope.removeHost = function (i, host) {
                if (host != null) {
                    $rootScope.hosts.history.splice(i, 1);
                    if ($rootScope.hosts.active.host == host.host) {
                        $rootScope.setHost($rootScope.hosts.history[0]);
                    } else {
                        localStorage.setItem("hosts", JSON.stringify($rootScope.hosts));
                        $route.reload();
                    }
                }
            };

            $http.get("data/requests.json").then(function (data) {
                $rootScope.requests = data.data;
                localStorage.setItem("requests", JSON.stringify(data.data));

                var hosts = localStorage.getItem("hosts");

                if (hosts !== null) {
                    $rootScope.hosts = JSON.parse(hosts);
                    $rootScope.requests.host = $rootScope.hosts.active.host;
                } else {
                    $rootScope.hosts = {
                        active: $rootScope.requests.defaultHost,
                        history: [$rootScope.requests.defaultHost]
                    };
                    localStorage.setItem("hosts", JSON.stringify($rootScope.hosts));
                }
            });

            if (localStorage.getItem("navigation") !== null) {
                $rootScope.navigation = JSON.parse(localStorage.getItem("navigation"));
            }

            $http.get("data/navigation.json").then(function (data) {
                $rootScope.navigation = data.data;
                localStorage.setItem("navigation", JSON.stringify(data.data));
            });

            $rootScope.setActive = function (item) {
                for (var i in  $rootScope.navigation.items) {
                    $rootScope.navigation.items[i].active = false;
                }

                $rootScope.subNavigation = item;
                if (item != null) item.active = true;
            };
        })

})(window.angular);
;