/*
    Fuetterungskurvenservices
*/
(function() {
    angular
        .module('calfguide')
        .service('CurvesServices', CurvesServices);

    function CurvesServices($http, $q, $rootScope) {
        var vmCurves = this;

        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        vmCurves.getCurves = getCurves;
        vmCurves.feedings = feedings;
        vmCurves.getTaxis = getTaxis;
        vmCurves.changeTaxi = changeTaxi;


       //Fuetterungskurven und Kalendardaten
        //Parameter: taxi_id
        //           date_from
        //           date_to
        //           feeding_id -> nur noetig, wenn vom Kalendar aus geklickt wird. Dort wird die Feeding-Id direkt im Objekt zum Tag gespeichert
        function feedings(taxi_id, date_from, date_to, feeding_id, heat, feed, cool, pasteur, Reinigen, process, feeder ) {
            var deferred = $q.defer();
            var promises = [];
            promises.push($http.get('ajax/curves/get_feedings_for_taxi_id.php?taxi_id=' + taxi_id + '&date_from=' + date_from + '&date_to=' + date_to + '&feeding_id=' + feeding_id + '&heat=' + heat + '&feed=' + feed + '&cool=' + cool + '&pasteur=' + pasteur + '&process=' + process + '&feeder=' + feeder + '&Reinigen=' + Reinigen));

           $q.all(promises).then( function(result) {
              deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }


        function getCurves(data) {
            var deferred = $q.defer();
            $http.post('ajax/curves/curves.php', $.param({'taxi_id' : data.taxi_id, 'feeding_id' : data.feeding_id, 'process_id' : data.process_id }) ).then(function (result) {
                deferred.resolve(result.data);
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

         function getTaxis(taxi_id) {
            var deferred = $q.defer();
            $http.get('ajax/settings/taxilist.php?taxi_id=' + taxi_id).then(function (result) {
                deferred.resolve(result);
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
