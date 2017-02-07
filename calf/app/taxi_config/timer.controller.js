/*
    Controller für TimerSeite eines Taxis

*/
(function () {
    angular
        .module('calfguide')
        .controller('TaxiTimerController', TaxiTimerController);

    TaxiTimerController.$inject = ['$scope', '$rootScope', 'loadPlugin', 'TaxiTimerServices', 'TaxiConfigServices', '$interval', '$stateParams'];

    function TaxiTimerController($scope, $rootScope, loadPlugin, TaxiTimerServices, TaxiConfigServices, $interval, $stateParams) {
        // Properties

        var vmTaxiTimer = this;
        vmTaxiTimer.taxi_id = $stateParams.taxi_id;
        $rootScope.GlobalData.taxis[0].taxi_id = $stateParams.taxi_id;
        vmTaxiTimer.data = loadPlugin;
        vmTaxiTimer.updatedTimer = [];
        vmTaxiTimer.flotMultiData = [];
        vmTaxiTimer.flotMultiOptions = [];
        vmTaxiTimer.getTaxis = getTaxis;

        vmTaxiTimer.changed = false;
        vmTaxiTimer.validate = true;
        vmTaxiTimer.startC = '';
        vmTaxiTimer.startF = '';
        vmTaxiTimer.isC = true;

        vmTaxiTimer.error = {
          'time': false,
          'temperature': false,
          'undefTimeRegex' : false,
          'undefTempRegex' : false,
          'emptyTime' : false,
          'emptyTemp' : false
        };

        function init() {
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
               vmTaxiTimer.taxi_id = taxi_id;
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
    vmTaxiTimer.getTaxis = [taxi_id, version, last_seen, elapse_time, is_selected, live_flag, sdcard_flag, set_time]
*******************************************************************************/
        function getTaxis() {
            TaxiConfigServices.getTaxis($stateParams.taxi_id).then(function (result) {
                vmTaxiTimer.getTaxis = result.data.taxi;
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
                  if(result.taxiconfig[i].name === 'ElhStartC') {
                    vmTaxiTimer.startC = result.taxiconfig[i].value;
                  }
                  if(result.taxiconfig[i].name === 'ElhStartF') {
                    vmTaxiTimer.startF = result.taxiconfig[i].value;
                  }
                  if(result.taxiconfig[i].name === 'Ident') {
                    vmTaxiTimer.ident = result.taxiconfig[i].value;
                  }

                }
            });
        }


/*****************************************************************************
Funktion: convertTemperature
Aktion: Formatiert Temperature zwischen Fahrenheit und Celsius
Parameter:
  data.temp_c : Temperatur in Celsius
  data.temp_f: Temperatur in Fahrenheit
Rueckgabe:
   umgewandelte Temperatur
*******************************************************************************/
        function convertTemperature(data) {
            var convertedTemp = 0;
            if(data.temp_c) {
                convertedTemp = Math.floor(( data.temp_c  * 1.8 ) + 32);
            }
            else if(data.temp_f) {
                convertedTemp = Math.floor(( data.temp_f - 32) / 1.8);
            }
            return parseInt(convertedTemp)
        }

/*****************************************************************************
Funktion: showChart
Aktion: Chart anzeigen. !!!Achtung: Zeitleiste ist geschaetzt und nur den Bildern des Timers im Milchtaxi nachgebaut
      Alle, ausser heizen
                   _____
       Y|         /     \
       B|----------------_________
        |       /
       X|_____ /
        |____________________________>
        |      A  C    D E

      Heizen
      B |        __________________
        |       /
       X|_____ /
        |____________________________>
        |      A C       D        E
Parameter:
 data: Daten der aktuellen Tabellenzeile
Rueckgabe:
 -
*******************************************************************************/

        function showChart(data) {
            var diagramData = [[]];

            //alert($rootScope.GlobalData.config.tempmessurement);
            diagramData =[
                          [0, X],  //Start
                          [A,X],  //0 zu A
                          [C,Y],  //zum hoechsten Punkt
                          [C_to_D, Y],  //Plateau
                          [E, B]  //PA fertig, dann auf Wunschtemperatur
            ];
            var X = 15;
            var Y;  //hoechster Punkt des Diagramms
            var A;
            var B = data.temp_c;
            var C;
            var C_to_D;
            var E;
            var F;

            if( data.process == 0) { //PA63/35
              Y = 63;
              if($rootScope.GlobalData.config.tempmessurement == 11){Y = 145}
              A = 10; // A = 35/2;
              C = A + 10;
              C_to_D = C + 35;
            }
            else if(data.process == 1) { //WB60/60
              A = 10; //A = 60/2;
              Y = 60;
              if($rootScope.GlobalData.config.tempmessurement == 11){Y = 140}
              C = A + 10;
              C_to_D = C + 60;

            }
            else if(data.process == 2) { //Heizen: Sonderfall
              A = 70; //A = 15;
              Y = B;
              C = A + 20;
              C_to_D = C + 60;

            }
            else if(data.process == 3) {  //PA60/70
              A = 10; //A = 70/2;
              C = A + 10;
              Y = 60;
              if($rootScope.GlobalData.config.tempmessurement == 11){Y = 140}
              C_to_D = C + 70;
            } else {

            }

            E = C_to_D + 10;
            F = E + 10;  //F = E + 20;


            if(data.process == 2) {  //Heizen
              diagramData =[
                          [0, X],  //Start
                          [A,X],  //0 zu A
                          [C,Y],  //zum hoechsten Punkt
                          //[C_to_D, Y],  //Plateau
                          [F, Y]
              ];

              var multiOptions = {
                axisLabels: {
                    show:true,
                },
                xaxes: [
                    {
                        ticks: [[A, "Start: " + data.time],[C, ""]],
                        min: 0,
                        max: F,
                        lines: {
                            show:true,
                        }
                    }
                ],
                yaxes: [
                    {
                      min: 0,
                      ticks: 4
                    },

                ],
                grid: {
                  hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem) {
                      if(flotItem.dataIndex == 1) {
                         return 'Start: ' + data.time;
                      }
                      else if(flotItem.dataIndex == 2) {
                         return 'Heated: ' + Y + ' ' + $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement);
                      } else {
                        return '';
                      }

                    },
                    onHover: function (flotItem, $tooltipEl) {
                    }
                }
              };

            }
            else {
               diagramData =[
                          [0, X],  //Start
                          [A,X],  //0 zu A
                          [C,Y],  //zum hoechsten Punkt
                          [C_to_D, Y],  //Plateau
                          [E, B],  //PA fertig, dann auf Wunschtemperatur
                          [F, B]
              ];

              var multiOptions = {
                axisLabels: {
                    show:true,
                },
                xaxes: [
                    {
                        ticks: [[A, "Start: " + data.time],[C_to_D, ""],[C, ""],[E, ""]],
                        min: 0,
                        max: F,
                        lines: {
                            show:true,
                        }
                    }
                ],
                yaxes: [
                    {
                      min: 0,
                      ticks: 4
                    },

                ],
                grid: {
                  hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem) {
                      if(flotItem.dataIndex == 1) {
                         return 'Start: ' + data.time;
                      }
                      else if(flotItem.dataIndex == 2) {
                         return 'Heated: ' + Y + ' ' + $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement);
                      }
                      else if(flotItem.dataIndex == 3) {
                         return 'End of heating: ' + Y + ' ' + $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement);
                      }
                      else if(flotItem.dataIndex == 4) {
                         return 'Target temperature: ' + B + ' ' + $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement);
                      } else {
                        return '';
                      }

                    },
                    onHover: function (flotItem, $tooltipEl) {
                    }
                }
              };
            }

            //Ende MultiOptions

            vmTaxiTimer.flotMultiData = [
                {
                    data:  diagramData,
                    //label:  $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement),
                    points: {
                        show: true,
                    },
                    lines: {
                        show:true,
                        lineWidth: '3'
                    },
                },
                {
                   //data: [[0, B], [E,B]]  //Temperatur
                }
            ];

            vmTaxiTimer.flotMultiOptions = multiOptions;
        };

/*****************************************************************************
Funktion: $scope.saveTimerChanges
Aktion: Speichern der Aenderungen bei Klick auf die Diskette
PHP-Datei: taxi_config/updateTimer.php
Parameter:
  data.temp_c : Temperatur in Celsius
  data.id: ID des Timers in der Datenbank
  data.process: Prozess-Art (siehe Kommentare)
  data.showChart: ChartAnzeigen ja nein (wird dann auf true gesetzt, vorher falls)
  data.state: 0
  data.taxi_id: aktuelle Taxi-ID
  data.temp_f: Temperatur in Fahrenheit
  data.time: Zeit-Feld
  data.timer_nr: Timer-Nr in der DB
Rueckgabe:
   vmTaxiTimer.updatedTimer = [message, status]
*******************************************************************************/
        $scope.saveTimerChanges = function(data) {
          var checked = true;
          var convertedTemperature;

             /*if(data.einheit == 0) {
               convertedTemperature =  convertTemperature({'temp_c' : data.temp_c});
                angular.forEach(vmTaxiTimer.data, function(value, key) {
                  vmTaxiTimer.data[key].temp_f = (value.id == data.id ? convertedTemperature :'' );
              });
             }

             if(data.einheit == 1) {

               convertedTemperature =  convertTemperature({'temp_f' : data.temp_f});
               angular.forEach(vmTaxiTimer.data, function(value, key) {
                  vmTaxiTimer.data[key].temp_c = (value.id == data.id ? convertedTemperature :'' );
               });
             }*/


             validateInputs(data);
             checked = unValidateStatus();
             var id = $rootScope.GlobalData.config.tempmessurement;
             data.temp_c1 = $rootScope.calcunits(id, 13, data.temp_c);
             if(checked == true) {

              TaxiTimerServices.saveTimerChanges(data).then(function (result) {
                  vmTaxiTimer.updatedTimer = result;

                  if( result.data.message == 'success' && result.data.status == 200) {
                    TaxiTimerServices.getTimer($stateParams.taxi_id).then(function (result) {

                      var data = result.data.timer;
                      var id = $rootScope.GlobalData.config.tempmessurement;
                      var i = 0;
                      for(i = 0; i <= data.length; i++){
                        angular.forEach(data[i], function(value, key){
                          if(key == "temp_c")
                             data[i][key] = $rootScope.calcunits(13, id, value)
                        });
                      }
                      vmTaxiTimer.data = data;
                      vmTaxiTimer.changed = false;
                      console.log(vmTaxiTimer.changed);
                      showChart(data);
                    });
                  }
              });
            }
            if(checked == false) {
              var id = $rootScope.GlobalData.config.tempmessurement;
              data.temp_c = $rootScope.calcunits(13, id, data.temp_c);
            }
        }
/*****************************************************************************
Funktion: $scope.enableContent
Aktion:  Enablen der gewuenschten Tabellenzeile und Anzeigen des Charts
Parameter:
  data: Daten aus der aktuellen Tabellenzeile
  index: $index-Variable
Rueckgabe:

*******************************************************************************/

        $scope.enableContent = function(data, index) {
            angular.forEach(vmTaxiTimer.data, function(value, key) {
                vmTaxiTimer.data[key].showChart = (value.id == data.id ? true : false );
            });

            showChart(data);
        }
/*****************************************************************************
Funktion: $scope.toggleOnOff
Aktion:   ON-OFF-Button des Timers. Setzt die Variable data.state auf 1 und aendert damit auch das font-awesome PNG
Parameter:
  data: Daten der aktuellen Tabellenzeile
Rueckgabe:

*******************************************************************************/

        $scope.toggleOnOff = function(data) {
            data.state == 0 ? data.state = 1 : data.state = 0;
             vmTaxiTimer.changed = true;
        }

/*****************************************************************************
Funktion: resetErrors
Aktion: Alle Fehler auf false. Validate auf true
Parameter:


*******************************************************************************/
        function resetErrors() {
          for (i in vmTaxiTimer.error) {
            vmTaxiTimer.error[i] = false;
          }
          vmTaxiTimer.validate = true;
        }

/*****************************************************************************
Funktion: unValidateStatus
Aktion: ueberpruefen, ob ein Fehler gesetzt ist. Dann checked auf false
Parameter:


*******************************************************************************/
        function unValidateStatus() {
          var checked;
          for (i in vmTaxiTimer.error) {
              if (vmTaxiTimer.error[i]) {
               vmTaxiTimer.validate = false;
               checked = false;
               break;
              } else {
                checked = true;
              }
          }
          return checked;
        }

/*****************************************************************************
Funktion: validateInputs
Aktion: Inputs ueberpruefen. Date und Temperatur werden ueberpruft (siehe Kommentare)
Parameter:
  data: aktuelles Data-Objekt

*******************************************************************************/
        function validateInputs(data) {
          var testDate;
          var testTemp_C;
          var testTemp_F;
          var time = String(data.time);
          var tempC = String(data.temp_c);
          var tempF = String(data.temp_f);


          var patternDate = /[0-2][0-9]:[0-5][0-9]/;  //Alles zwischen 00:00-23:59 wird zugelassen
          var patternTemperature = /^[-+]?\d+$/; //nur ganzzahlig

          resetErrors();

          if($rootScope.GlobalData.config.tempmessurement == 13){
            if(parseInt(tempC) < 0 || parseInt(tempC) > parseInt(vmTaxiTimer.startC)) {
               //data.temp_c = vmTaxiTimer.startC;
               vmTaxiTimer.error.temperature = true;
            }
            vmTaxiTimer.isC = true;
          }
          else {
            if(parseInt(tempC) < 32 || parseInt(tempC) > parseInt(vmTaxiTimer.startF)) {
              //data.temp_f = vmTaxiTimer.startF;
              vmTaxiTimer.error.temperature = true;
            }
            vmTaxiTimer.isC = false;
          }

          if(typeof tempF === 'undefined' || tempF === '' || tempC === '' || typeof tempC === 'undefined') {
             vmTaxiTimer.error.emptyTemp = true;
          }
          if(typeof time === 'undefined' || time === '') {
            vmTaxiTimer.error.emptyTime = true;
          }

          if(time) {
            testDate = data.time.match(patternDate);

            if(testDate == null || typeof testDate === 'undefined') {
              vmTaxiTimer.error.undefTimeRegex = true;
            }
          }
          if(tempC || tempF) {
            testTemp_C = tempC.match(patternTemperature);
            testTemp_F = tempF.match(patternTemperature);
            if(testTemp_F === null || testTemp_C === null || typeof testTemp_C === 'undefined' || typeof testTemp_F === 'undefined') {
              vmTaxiTimer.error.undefTempRegex = true;
            }
          }


          console.log(testTemp_C);
          console.log(testTemp_F);

        }

/*****************************************************************************
Funktion: $scope.itemChanges
Aktion:   Event-Listener, um das Chart bei geaenderten Werten neu zu laden
Parameter:
  data: Daten der aktuellen Tabellenzeile
Rueckgabe:

*******************************************************************************/

        $scope.itemChanges = function(data) {
          var convertedTemperature;
           vmTaxiTimer.changed = true;
           vmTaxiTimer.validate = true;

           if(data.einheit == 0) {
             convertedTemperature =  convertTemperature({'temp_c' : data.temp_c});
              angular.forEach(vmTaxiTimer.data, function(value, key) {
                vmTaxiTimer.data[key].temp_f = (value.id == data.id ? convertedTemperature :'' );
            });
           }

           if(data.einheit == 1) {
             convertedTemperature =  convertTemperature({'temp_f' : data.temp_f});
             angular.forEach(vmTaxiTimer.data, function(value, key) {
                vmTaxiTimer.data[key].temp_c = (value.id == data.id ? convertedTemperature :'' );
             });
           }


           showChart(data);
        }

/*****************************************************************************
Funktion: $scope.restoreChanges
Aktion:  Wiederherstellen der alten Daten
Parameter:
  data: Daten aus der aktuellen Tabellenzeile
  index: $index-Variable
Rueckgabe:

*******************************************************************************/
      $scope.restoreChanges = function(data) {
        var newDataForChart = '';
         TaxiTimerServices.getTimer($stateParams.taxi_id).then(function (result) {
             vmTaxiTimer.data = result.data.timer;
             angular.forEach(vmTaxiTimer.data, function(value, key) {
                if(value.id == data.id) {
                  newDataForChart = vmTaxiTimer.data[key];
                }
                vmTaxiTimer.data[key].showChart = (value.id == data.id ? true : false );
            });
             vmTaxiTimer.changed = false;
             resetErrors();
            showChart(newDataForChart);
        });
      }


      //bablu//

      $scope.closeContent = function(data) {

            angular.forEach(vmTaxiTimer.data, function(value, key) {

                vmTaxiTimer.data[key].showChart = null;
            });


        }




    }

})();
