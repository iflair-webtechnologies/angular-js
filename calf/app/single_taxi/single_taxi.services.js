/*
    Services fuer die Uebersichtsseite zu einem Taxi   
*/
(function() {
    angular
        .module('calfguide')
        .service('SingleTaxiServices', SingleTaxiServices);

    function SingleTaxiServices($http, $q, $rootScope) {
        var vm = this;
        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        vm.getDataTaxi = getDataTaxi;
        vm.getTimer = getTimer;
        vm.getDataProcess = getDataProcess;
        vm.getTaxis = getTaxis;
        vm.changeTaxi = changeTaxi;
        vm.changeElapseTime = changeElapseTime;
        vm.getTaxiConfig = getTaxiConfig;


        function getDataTaxi(taxi_id) {  
            var deferred = $q.defer();
            $http.get('ajax/single_taxi/taximain.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }
        function getTimer(taxi_id) {         
            var deferred = $q.defer();
            $http.get('ajax/single_taxi/getTimer.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }
        function getDataProcess(taxi_id) {         
            var deferred = $q.defer();
            $http.get('ajax/single_taxi/getlivedata.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });
           
            return deferred.promise;
        }

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

        function changeElapseTime(taxi_id, leave_page) {         
            var deferred = $q.defer();
            $http.get('ajax/single_taxi/changeElapseTime.php?taxi_id=' + taxi_id + '&leave_page=' + leave_page).then(function (result) {
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