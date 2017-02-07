/*
    Controller für die Uebersichtsseite zu einem Taxi

*/
(function () {
    angular
        .module('calfguide')
        .controller('DosingsController', DosingsController)
        .controller('ModalInstanceCtrl', ModalInstanceCtrl)
        .controller('DeleteModalInstanceCtrl', DeleteModalInstanceCtrl)
        .directive('numbersOnly', OnlyNumberDirective);



        function OnlyNumberDirective() {
          return {
            require: '?ngModel',
              link: function(scope, element, attrs, ngModelCtrl) {
                if(!ngModelCtrl) {
                  return;
                }

                ngModelCtrl.$parsers.push(function(val) {
                  if (angular.isUndefined(val)) {
                      var val = '';
                  }

                  var clean = val.replace(/[^-0-9\.]/g, '');
                  var negativeCheck = clean.split('-');
      			var decimalCheck = clean.split('.');
                  if(!angular.isUndefined(negativeCheck[1])) {
                      negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                      clean =negativeCheck[0] + '-' + negativeCheck[1];
                      if(negativeCheck[0].length > 0) {
                      	clean =negativeCheck[0];
                      }

                  }

                  if(!angular.isUndefined(decimalCheck[1])) {
                      decimalCheck[1] = decimalCheck[1].slice(0,2);
                      clean =decimalCheck[0] + '.' + decimalCheck[1];
                  }

                  if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                  }
                  return clean;
                });

                element.bind('keypress', function(event) {
                  if(event.keyCode === 32) {
                    event.preventDefault();
                  }
                });
                }
            };
        }

    DosingsController.$inject = ['$scope', '$rootScope', 'loadPlugin', 'DosingsServices', 'TaxiConfigServices', '$stateParams', '$modal', '$timeout'];

    function DosingsController($scope, $rootScope, loadPlugin, DosingsServices, TaxiConfigServices, $stateParams, $modal, $timeout) {

      vmDosings = this;
      vmDosings.taxi_id = $stateParams.taxi_id;
      if($rootScope.GlobalData.taxis.length > 0) {
        $rootScope.GlobalData.taxis[0].taxi_id = $stateParams.taxi_id;
      }
      vmDosings.data = loadPlugin;
      vmDosings.getTaxis = getTaxis;
      vmDosings.checked == false;
      vmDosings.validate = true;
      vmDosings.error = {
        'level' : false,
        'undef' : false,
        'exist' : false
      }


      function init()  {
          getTaxiConfig();
          getTaxis();
       }
      init();



/*****************************************************************************
Funktion: $scope.changeTaxi
Aktion: Auswaehlen eines Taxis aus der DropdownBox und Neuladen der Seite
PHP-Datei: single_taxi/changetaxi.php
Parameter:
    taxi_id: die aktuelle TaxiID aus den $stateParams
Rueckgabe:
    result = [errorcode, message, status]
*******************************************************************************/
        $scope.changeTaxi = function(taxi_id) {
            TaxiConfigServices.changeTaxi(taxi_id).then(function (result) {
              if(result.errorcode == 1) {
               vmDosings.taxi_id = taxi_id;
                }
            });
        }

      /*****************************************************************************
Funktion: getTaxis()
Aktion: Holt alle "meine" Taxis aus der Tabelle taxilist. Ergebnisse werden in die Dropdownbox geschrieben
PHP-Datei: single_taxi/taxilist.php
Parameter:
   -
Rueckgabe:
    vmDosings.getTaxis = [taxi_id, version, last_seen, elapse_time, is_selected, live_flag, sdcard_flag, set_time]
*******************************************************************************/
        function getTaxis() {
            TaxiConfigServices.getTaxis($stateParams.taxi_id).then(function (result) {
                vmDosings.getTaxis = result.data.taxi;
            });
        }

/*****************************************************************************
Funktion: getTaxiConfig()
Aktion:
PHP-Datei: taxi_config/getTaxiConfig.php
Parameter:
   -
Rueckgabe:

*******************************************************************************/
        function getTaxiConfig() {
            TaxiConfigServices.getTaxiConfig($stateParams.taxi_id).then(function (result) {
              for (var i in result.taxiconfig) {
                if(result.taxiconfig[i].name === 'Ident') {
                  vmDosings.ident = result.taxiconfig[i].value;

                }
              }

            });
        }

/*****************************************************************************
Funktion: $scope.saveChanges
Aktion: Speichern der Aenderungen bei Klick auf die Diskette
PHP-Datei: taxi_config/updateDosing.php
Parameter:
  data.id: ID des Timers in der Datenbank
  data.level: Level-Wert / Input-Feld
  data.dos_nr: Dosierungsnummer in der DB zum Taxi
Rueckgabe
*******************************************************************************/
        $scope.saveChanges = function(data) {
          checkValues(data);
          var checked = true;
          for (i in vmDosings.error) {
            if (vmDosings.error[i]) {
              checked = false;
              vmDosings.validate  = false;
              break;
            }
          }
          if(checked == true) {
             DosingsServices.saveChanges(data).then(function (result) {
                if( result.data.message == 'success' && result.data.status == 200) {
                    DosingsServices.getDosings($stateParams.taxi_id).then(function (result) {
                      //vmDosings.data = result.data.dosings
                      var data = result.data.dosings;
                      var id = $rootScope.GlobalData.config.volumemessurement;
                      var i = 0;
                      for(i = 0; i <= data.length; i++){
                        angular.forEach(data[i], function(value, key){
                          if(key == "level")
                             data[i][key] = $rootScope.calcunits(9, id, value)
                        });
                      }
                      vmDosings.data = data;
                  });
                }
                else if( result.data.message == 'Data Already Exist') {
                  vmDosings.error.exist = true;
                  vmDosings.validate = false;
                }
            });
          }
        }

/*****************************************************************************
Funktion: $scope.itemChanges
Aktion: Eventlistener auf Text-Input
Parameter:
  data.id: ID des Timers in der Datenbank
  data.level: Level-Wert / Input-Feld
  data.dos_nr: Dosierungsnummer in der DB zum Taxi
Rueckgabe
*******************************************************************************/
        $scope.itemChanges = function(data) {
            vmDosings.checked = true;
            vmDosings.validate  = true;
          //   checkValues(data);
          //   for (i in vmDosings.error) {
          //   if (vmDosings.error[i]) {
          //     checked = false;
          //     vmDosings.validate  = false;
          //     break;
          //   }
          // }

        }

/*****************************************************************************
Funktion: vmDosings.openModal
Aktion: Einen neuen Eintrag hinzufuegen
Parameter:
  -
Rueckgabe:
    Wenn der Eintrag erfolgreich hinzugefuegt wurde, dann wird die Seite neu geladen
*******************************************************************************/
      $scope.openModal = function() {
        var modalInstance = $modal.open({
          templateUrl: 'views/taxi_config/modal.html',
          controller: 'ModalInstanceCtrl'
        });

        modalInstance.result.then(function (result) {
          DosingsServices.getDosings($stateParams.taxi_id).then(function (result) {
            //vmDosings.data = result.data.dosings;
            var data = result.data.dosings;
            var id = $rootScope.GlobalData.config.volumemessurement;
            var i = 0;
            for(i = 0; i <= data.length; i++){
              angular.forEach(data[i], function(value, key){
                if(key == "level")
                   data[i][key] = $rootScope.calcunits(9, id, value)
              });
            }
            vmDosings.data = data;
         });
      });
    }

/*****************************************************************************
Funktion: $scope.enableContent
Aktion: Die jeweilige Tabellenzeile enablen
Parameter:
  data: aktuelles Data-Objekt

*******************************************************************************/
      $scope.enableContent = function(data, $index) {

            angular.forEach(vmDosings.data, function(value, key) {
                vmDosings.data[key].enableContent = (value.id == data.id ? true : false );
            });
            $timeout(function () {
              $('.input-'+ $index).focus();
              $('.input-'+ $index).val($('.input-'+ $index).val());
            });
      }


/*****************************************************************************
Funktion: vmDosings.removeFromList
Aktion: Eintrag entfernen
Parameter:
  data.id: id des Eintrages in der DB
Rueckgabe:
  Wenn erfolgreich, dann Seite neu laden
*******************************************************************************/
        $scope.removeFromList = function(data) {
          $timeout(function () {
            var modalInstance = $modal.open({
              templateUrl: 'views/taxi_config/delete_modal.html',
              controller: 'DeleteModalInstanceCtrl'
            });

            modalInstance.result.then(function (result) {
              if(result == 'yes'){
              DosingsServices.removeFromList(data).then(function (result) {
                   if (result.errorcode == 1 ) {
                       DosingsServices.getDosings($stateParams.taxi_id).then(function (result) {
                        //vmDosings.data = result.data.dosings;
                        var data = result.data.dosings;
                        var id = $rootScope.GlobalData.config.volumemessurement;
                        var i = 0;
                        for(i = 0; i <= data.length; i++){
                          angular.forEach(data[i], function(value, key){
                            if(key == "level")
                               data[i][key] = $rootScope.calcunits(9, id, value)
                          });
                        }
                        vmDosings.data = data;
                      });
                  }
              });
            }
            });

          });
        }
/*****************************************************************************
Funktion: $scope.restoreChanges
Aktion: Aenderungen wiederherstellen, die gemacht worden sind vorm Speichern
Parameter:
  data: aktuelles Data-Objekt

*******************************************************************************/
       $scope.restoreChanges = function(data) {
        DosingsServices.getDosings($stateParams.taxi_id).then(function (result) {
          //vmDosings.data = result.data.dosings;
          var data = result.data.dosings;
          var id = $rootScope.GlobalData.config.volumemessurement;
          var i = 0;
          for(i = 0; i <= data.length; i++){
            angular.forEach(data[i], function(value, key){
              if(key == "level")
                 data[i][key] = $rootScope.calcunits(9, id, value)
            });
          }
          vmDosings.data = data;
          angular.forEach(vmDosings.data, function(value, key) {
            if(value.id == data.id) {
              newDataForChart = vmDosings.data[key];
            }
          });
          vmDosings.changed = false;
        });
      }
/*****************************************************************************
Funktion: checkValues
Aktion: Validierung des Input-Feldes. Es wird auf Float mit einer Nachkommastelle und '.' geprueft. Werte kleiner 0.1 sind nicht zugelassen
Parameter:
  data: aktuelles Data-Objekt

*******************************************************************************/

      function checkValues(data){

        for (i in vmDosings.error) {
            vmDosings.error[i] = false;
        }

        var levelPattern = /^[0-9]{1,2}(?:\.[0-9]{1})?$/;    //Zwei Stellen vor Komma, eine Stellen nach Komma. Getrennt durch .
        var testLevel;

        if(typeof data.level === 'undefined' ||data.level === '') {
            vmDosings.error.undef = true;
        }

        if(data.level) {
          testLevel = data.level.match(levelPattern);
          if(testLevel === null || typeof testLevel === 'undefined') {
            vmDosings.error.level = true;
          }
        }
        if( data.level * 10 < 1 ) {
          vmDosings.error.level = true;
        }
      }

    }


    DeleteModalInstanceCtrl.$inject = ['$scope', '$modalInstance', '$rootScope'];

    function DeleteModalInstanceCtrl($scope, $modalInstance,  $rootScope) {
      $scope.close = function() {
        $modalInstance.close();
      }

      $scope.deleteNow = function() {
        $modalInstance.close('yes');
      }
    }

    ModalInstanceCtrl.$inject = ['$scope', '$modalInstance', 'DosingsServices', '$rootScope'];

    function ModalInstanceCtrl($scope, $modalInstance, DosingsServices, $rootScope) {
        $scope.newObject = {};  //Speicher fuer das Level im Modal
        $scope.Nan = false;

        vmDosingsModal = this;
        vmDosingsModal.error = {
          'level' : false,
          'undef' : false,
          'level_exist' : false,
        };
        vmDosingsModal.validate == true;

        function checkValues(level){

          for (i in vmDosingsModal.error) {
              vmDosingsModal.error[i] = false;
          }
          $scope.level_error = false;
          $scope.level_undef = false;

          var levelPattern = /^[0-9]{1,2}(?:\.[0-9]{2})?$/;    //Zwei Stellen vor Komma, eine Stellen nach Komma. Getrennt durch .
          var testLevel;

          if(typeof level === 'undefined' || level === '') {
              vmDosingsModal.error.undef = true;
              $scope.level_undef = true;
          }

          if(level) {
            testLevel = level.match(levelPattern);
            if(testLevel === null || typeof testLevel === 'undefined') {
              vmDosingsModal.error.level = true;
              $scope.level_error = true;
            }
          }
          if( level * 10 < 1 ) {
            vmDosingsModal.error.level = true;
            $scope.level_error= true;
          }
        }
/*****************************************************************************
Funktion: $scope.close
Aktion: Modal schließen
Parameter:
  -
Rueckgabe:
    Wenn der Eintrag erfolgreich hinzugefuegt wurde, dann wird die Seite neu geladen
*******************************************************************************/
        $scope.close = function() {
          $modalInstance.close();
        }
/*****************************************************************************
Funktion: $scope.submitForm
Aktion: Absenden des Formulars, wenn keine Fehler vorhanden sind
Parameter:  -
Rueckgabe:

*******************************************************************************/
        $scope.submitForm = function() {
          $scope.submitted = true;
          $scope.newObject.taxi_id = $rootScope.GlobalData.taxis[0].taxi_id;
          var id = $rootScope.GlobalData.config.volumemessurement;
          $scope.newObject.level = $rootScope.calcunits(id, 9, $scope.level);


          var checked;

          checkValues($scope.level);
          var checked = true;
          for (i in vmDosingsModal.error) {
            if (vmDosingsModal.error[i]) {
              checked = false;
              vmDosingsModal.validate == false;
              break;
            }
          }
          if(checked == true) {
             //$modalInstance.close($scope.newObject);
             DosingsServices.addDosingToList($scope.newObject).then(function (result) {
                if (result.status == 200 && result.errorcode == 1) {
                  $modalInstance.close('success');
                }
                else if( result.message == 'Data Already Exist' ) {
                  $scope.level_exist = true;
                  vmDosingsModal.validate = false;
                }
             });
          }

        }

    }
})();
