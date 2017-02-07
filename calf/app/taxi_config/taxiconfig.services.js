
(function() {
    angular
        .module('calfguide')
        .service('TaxiConfigServices', TaxiConfigServices);

    function TaxiConfigServices($http, $q, $rootScope) {

        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        var vmTaxiTimer = this;
        vmTaxiTimer.getTaxis = getTaxis;
        vmTaxiTimer.changeTaxi = changeTaxi;
        vmTaxiTimer.getTaxiConfig = getTaxiConfig;
     
        function getTaxis(taxi_id) {         
            var deferred = $q.defer();
            $http.get('ajax/settings/taxilist.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }
        function changeTaxi(taxi_id) {         
            var deferred = $q.defer();
            $http.get('ajax/single_taxi/changetaxi.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }
        function getTaxiConfig(taxi_id) {
            var deferred = $q.defer();
            $http.get('ajax/taxi_config/getTaxiConfig.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }
    }

})();