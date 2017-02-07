
(function() {
    angular
        .module('calfguide')
        .service('DosingsServices', DosingsServices);

    function DosingsServices($http, $q, $rootScope) {

        // Rückgabewert von Requests per default auf JSON setzen
        $http.defaults.headers.common.accept = 'application/json';
        $http.defaults.headers.post["Content-Type"] = 'application/x-www-form-urlencoded; charset=utf-8';

        var vmDosings = this;
        vmDosings.getDosings = getDosings;
        vmDosings.addDosingToList = addDosingToList;
        vmDosings.saveChanges = saveChanges;
        vmDosings.removeFromList = removeFromList;

        function getDosings(taxi_id) {
            var deferred = $q.defer();
            $http.get('ajax/taxi_config/getDosings.php?taxi_id=' + taxi_id).then(function (result) {
                angular.forEach(result.data.dosings, function(value, key) {
                   result.data.dosings[key].level = parseFloat(value['level']) / 1000;
                });

                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }

        function addDosingToList(data) {
            var deferred = $q.defer();
            $http.post('ajax/taxi_config/addDosingToList.php', $.param({'taxi_id' : data.taxi_id, 'level': data.level * 1000 })).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }

         function removeFromList(data) {
            var deferred = $q.defer();
            $http.post('ajax/taxi_config/removeDosingFromList.php', $.param({'id' : data.id, 'taxi_id': data.taxi_id })).then(function (result) {
                deferred.resolve(result.data);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }

        function saveChanges(data) {
          $.ajaxSetup({async: false});
          var id = $rootScope.GlobalData.config.volumemessurement;
          data['level'] = $rootScope.calcunits(id, 9, data['level']);
            var deferred = $q.defer();
            $http.post('ajax/taxi_config/updateDosing.php', $.param({'data' : data}) ).then(function (result) {
                deferred.resolve(result);
            }).catch(function (reason) {
                deferred.reject(reason);
            });

            return deferred.promise;
        }


    }

})();
