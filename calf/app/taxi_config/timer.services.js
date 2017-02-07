
(function() {
    angular
        .module('calfguide')
        .service('TaxiTimerServices', TaxiTimerServices);

    function TaxiTimerServices($http, $q, $rootScope) {

        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        var vmTaxiTimer = this;
        vmTaxiTimer.getTimer = getTimer; 
        vmTaxiTimer.saveTimerChanges =  saveTimerChanges;

        function getTimer(taxi_id) {
            var deferred = $q.defer();
            $http.get('ajax/taxi_config/getAllTimers.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }

        

        function saveTimerChanges(data) {  
            var deferred = $q.defer();
            $http.post('ajax/taxi_config/updateTimer.php', $.param({'data' : data}) ).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }
    }

})();