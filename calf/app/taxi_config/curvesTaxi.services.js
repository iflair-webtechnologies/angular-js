
(function() {
    angular
        .module('calfguide')
        .service('CurvesTaxiServices', CurvesTaxiServices);

    function CurvesTaxiServices($http, $q, $rootScope) {

        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        var vmCurvesTaxiService = this;
        vmCurvesTaxiService.getFeedingCurves = getFeedingCurves;
        // vmDosings.addDosingToList = addDosingToList;
        vmCurvesTaxiService.saveChanges = saveChanges;
        // vmDosings.removeFromList = removeFromList;

        function getFeedingCurves(taxi_id) {
            var deferred = $q.defer();
            $http.get('ajax/taxi_config/getFeedingCurves.php?taxi_id=' + taxi_id).then(function (result) {

                angular.forEach(result.data.curves, function(value, key) {
                   result.data.curves[key].a = parseFloat(value['a']) / 1000;
                   result.data.curves[key].b = parseFloat(value['b']) / 1000;
                });
                deferred.resolve(result);

            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }

        // function addDosingToList(data) {
        //     var deferred = $q.defer();
        //     $http.post('ajax/taxi_config/addDosingToList.php', $.param({'taxi_id' : data.taxi_id, 'level': data.level * 1000 })).then(function (result) {
        //         deferred.resolve(result.data);
        //     }).catch(function (reason) {
        //         deferred.reject(reason);
        //     });

        //     return deferred.promise;
        // }

        //  function removeFromList(data) {
        //     var deferred = $q.defer();
        //     $http.post('ajax/taxi_config/removeDosingFromList.php', $.param({'id' : data.id, 'taxi_id': data.taxi_id })).then(function (result) {
        //         deferred.resolve(result.data);
        //     }).catch(function (reason) {
        //         deferred.reject(reason);
        //     });

        //     return deferred.promise;
        // }

        function saveChanges(data1) {
          var id = $rootScope.GlobalData.config.volumemessurement;
          data1.a = $rootScope.calcunits(id, 9, data1.a);
          data1.b = $rootScope.calcunits(id, 9, data1.b);
            var deferred = $q.defer();
            $http.post('ajax/taxi_config/updateFeeding.php', $.param({'data' : data1}) ).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }


    }

})();
