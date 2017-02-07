/*
    Controller für Futterkuven-Config zu einem Taxi

*/
(function () {
    angular
        .module('calfguide')
        .controller('CurvesTaxiController', CurvesTaxiController)
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

    CurvesTaxiController.$inject = ['$scope', '$rootScope', 'loadPlugin', 'CurvesTaxiServices', 'TaxiConfigServices', '$interval', '$stateParams'];

    function CurvesTaxiController($scope, $rootScope, loadPlugin, CurvesTaxiServices, TaxiConfigServices, $interval, $stateParams) {
    	vmCurvesTaxi = this;
    	vmCurvesTaxi.data = loadPlugin;
      vmCurvesTaxi.getTaxis = getTaxis;
      vmCurvesTaxi.taxi_id = $stateParams.taxi_id;
      $rootScope.GlobalData.taxis[0].taxi_id = $stateParams.taxi_id;

      vmCurvesTaxi.checkValues = checkValues;

      vmCurvesTaxi.error = {
        'a': false,
        'b': false,
        'c': false,
        'd': false,
        'e': false,
        'f': false,
        'aUndef' : false,
        'bUndef' : false,
        'cUndef' : false,
        'dUndef' : false,
        'eUndef' : false,
        'fUndef' : false,
        'undef' : false,
        'match' : false,
        'maxAmount' : false,
        'minAmount' : false,
        'wrongInput' : false,
      };
      vmCurvesTaxi.changed = false;
      vmCurvesTaxi.validate = true;
      vmCurvesTaxi.oldValues = '';

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
               vmCurvesTaxi.taxi_id = taxi_id;
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
                vmCurvesTaxi.getTaxis = result.data.taxi;
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
                  vmCurvesTaxi.ident = result.taxiconfig[i].value;

                }
              }

            });
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
          angular.forEach(vmCurvesTaxi.data, function(value, key) {
              vmCurvesTaxi.data[key].enableContent = (value.crv_nr == data.crv_nr ? true : false );
          });
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
         CurvesTaxiServices.getFeedingCurves($stateParams.taxi_id).then(function (result) {

             var data = result.data.curves;
             var id = $rootScope.GlobalData.config.volumemessurement;
             var i = 0;
             for(i = 0; i <= data.length; i++){
               angular.forEach(data[i], function(value, key){
                 if(key == "a" || key == "b")
                    data[i][key] = $rootScope.calcunits(9, id, value)
               });
             }
             vmCurvesTaxi.data = data;
             angular.forEach(vmCurvesTaxi.data, function(value, key) {
                if(value.crv_nr == data.crv_nr) {
                  newDataForChart = vmCurvesTaxi.data[key];
                }
                vmCurvesTaxi.data[key].enableContent = (value.crv_nr == data.crv_nr ? true : false );
            });
            vmCurvesTaxi.changed = false;
            vmCurvesTaxi.validate = true;
            showChart(newDataForChart);
        });
      }
/********************Close ********************************/
$scope.closeContent = function(data, index) {
          angular.forEach(vmCurvesTaxi.data, function(value, key) {
              vmCurvesTaxi.data[key].enableContent = null;
          });


      }



      /*****************************************************************************
Funktion: $scope.saveChanges
Aktion: Speichern der Aenderungen bei Klick auf die Diskette
PHP-Datei: taxi_config/updateFeeding.php
Parameter:
  data.crv_nr : Kurvennummer;
  data.a-f: einzelnen Punkte des Charts
Rueckgabe:

*******************************************************************************/
      $scope.saveChanges = function(data) {

        checkValues(data);
        var checked = true;
        for (i in vmCurvesTaxi.error) {
          if (vmCurvesTaxi.error[i]) {
            checked = false;
            vmCurvesTaxi.validate  = false;
             break;
          }
        }
        var temp_data = data;
        var data_old = data;
        if(checked == true) {
          /*for(var para in temp_data) {
            if(para === 'a') {
              temp_data[para] = parseFloat(temp_data[para]) * 1000;
            }
            if(para === 'b') {
              temp_data[para] = parseFloat(temp_data[para]) * 1000;
            }
          }*/

          CurvesTaxiServices.saveChanges(data).then(function (result) {
            if( result.data.message == 'success' && result.data.status == 200) {
              CurvesTaxiServices.getFeedingCurves($stateParams.taxi_id).then(function (result) {
                var data = result.data.curves;
                var id = $rootScope.GlobalData.config.volumemessurement;
                var i = 0;
                for(i = 0; i <= data.length; i++){
                  angular.forEach(data[i], function(value, key){
                    if(key == "a" || key == "b")
                       data[i][key] = $rootScope.calcunits(9, id, value)
                  });
                }

                vmCurvesTaxi.data = data;
                /*angular.forEach(vmCurvesTaxi.data, function(value, key) {
                   if(value.crv_nr == data.crv_nr) {
                     newDataForChart = vmCurvesTaxi.data[key];
                   }
                   //vmCurvesTaxi.data[key].enableContent = (value.crv_nr == data.crv_nr ? true : false );
               });*/
               vmCurvesTaxi.changed = false;
               vmCurvesTaxi.validate = true;
               //showChart(newDataForChart);
                //vmCurvesTaxi.data = '';
                //vmCurvesTaxi.data = result.data.curves;
                //data = result.data.curves;
                /*angular.forEach(vmCurvesTaxi.data, function(value, key) {
                  vmCurvesTaxi.data[key].enableContent = (value.crv_nr == data.crv_nr ? true : false );
                });
                for(var para in data) {
                  if(para === 'a') {
                    data[para] = parseFloat(data[para]) / 1000;
                  }
                  if(para === 'b') {
                    data[para] = parseFloat(data[para]) / 1000;
                  }
                }
                showChart(data);
                vmCurvesTaxi.validate = true;
                vmCurvesTaxi.changed = false;*/
              });
            }
          });
        } else {
          
          showChart(data);
        }
      }

/*****************************************************************************
Funktion: $scope.updateChart
Aktion:   Event-Listener, um das Chart bei geaenderten Werten neu zu laden
Parameter:
  data: Daten der aktuellen Tabellenzeile
Rueckgabe:

*******************************************************************************/

      $scope.updateChart = function(data) {
        vmCurvesTaxi.changed = true;
          vmCurvesTaxi.validate = true;
          // if( data['a'] == '') {
          //   data['a'] = "0";
          // }
          showChart(data);

      }
/*****************************************************************************
Funktion: checkValues
Aktion:   Ueberprueft, ob folgende Bedingungen eingehalten sind.
          a) c < d < e < f. Sonst c = d-1; d = e-1; e=f-1; f=255
          b) 0 < a < 20. Sonst a = 20
          c) 0 < b < 20. Sonst b = 20
          d) a und b = float mit maximal einer Nachkommastelle
          e) c,d,e,f INT
          Wenn nicht, dann wird der Speicher-Button ausgeblendet
Parameter:
  data: Daten der aktuellen Tabellenzeile
Rueckgabe:

*******************************************************************************/

      function checkValues(data) {

        var amountPattern = /^[0-9]{1,2}(?:\.[0-9]{1})?$/;
        var patternDays = /^[-+]?\d+$/;

        console.log(data);
        //Alle zu Beginn zurücksetzen
        for (i in vmCurvesTaxi.error) {
          vmCurvesTaxi.error[i] = false;
          vmCurvesTaxi.validate = true;
        }
        var testA = String(data['a']).match(amountPattern);
        var testB =  String(data['b']).match(amountPattern);
        var testC = String(data['c']).match(patternDays);
        var testD =  String(data['d']).match(patternDays);
        var testE = String(data['e']).match(patternDays);
        var testF = String(data['f']).match(patternDays);



        if(typeof data['a'] === 'undefined' || data['a'] == '' || testA === null || testA === 'undefined') {
           vmCurvesTaxi.error.aUndef = true;
         }
        if(typeof data['b'] === 'undefined' || data['b'] == '' || testB === null || testB === 'undefined') {
          vmCurvesTaxi.error.bUndef = true;
        }
        if(typeof data['c'] === 'undefined' || data['c'] == '' || testC === null || testC === 'undefined') {

          data['c'] = 0;
        }
        if(typeof data['d'] === 'undefined' || data['d'] == '' || testD === null || testD === 'undefined') {
          data['d'] = parseInt(data['c']) + 1;

        }
        if(typeof data['e'] === 'undefined' || data['e'] == '' || testE === null || testE === 'undefined') {
          data['e'] = parseInt(data['d']) + 1;

        }
        if(typeof data['f'] === 'undefined' || data['f'] == '' || testF === null || testF === 'undefined') {

           data['f'] = parseInt(data['e']) + 1;
        }

        if(data['f'] > 255) {
            data['f'] = 255;

        }
        if(data['c'] < 0) {
          data['c'] = 0;

        }
        if(data['b'] > 20) {
          data['b'] = 20;
          vmCurvesTaxi.error.maxAmount = true;
        }
        if(parseInt(data['a']) > 20) {
          data['a'] = 20;
          vmCurvesTaxi.error.maxAmount = true;
        }

        if(parseInt(data['c']) >= parseInt(data['d'])) {
          vmCurvesTaxi.error.wrongInput = true;
          //data['d'] = parseInt(data['c']) + 1;

        }
        if( parseInt(data['d']) >= parseInt(data['e'])) {
          vmCurvesTaxi.error.wrongInput = true;
          //data['e'] = parseInt(data['d']) + 1;

        }
        if(parseInt(data['e']) >= parseInt(data['f'])) {
          vmCurvesTaxi.error.wrongInput = true;
          //data['f'] = parseInt(data['e']) + 1;

        } else {
        }
      }

/*****************************************************************************
Funktion: showChart
Aktion: Chart anzeigen. !!!Achtung: Zeitleiste ist geschaetzt und nur den Bildern der Futterkurve im Milchtaxi nachgebaut


      B |        ________
        |       /'       '\
      A |_____ / '       ' \
        |________'_______'__\_____________>
        |   C    D       E   F
Parameter:
 data: Daten der aktuellen Tabellenzeile
Rueckgabe:
 -
*******************************************************************************/


    	function showChart(data) {
           var yaxesMax = parseInt(data['b']) > parseInt(data['a']) ? (parseInt(data['b']) + 5) : (parseInt(data['a']) + 5) ;
           var xaxesMax = parseInt(data['f']);

           if(data['f'] < 9) { xaxesMax = 9; }

           var diagramData = [
                           [0, data['a']],   //0 A Wert
                           [data['c'], data['a']],     //A zu C
                           [data['d'], data['b']], //C zu D
                           [data['e'], data['b']],  //D zu E
                           [data['f'], 0], // E zu F
                        ]
            var multiOptions = {
                axisLabels: {
                    show:true,
                },
                xaxes: [
                    {
                      ticks: [data['c'],data['d'],data['e'],data['f']],
                      min: 0,
                      tickDecimals: 0,
                      max: data['f']
                    }
                ],
                yaxes: [
                    {
                      min: 0,
                      max: yaxesMax
                    },

                ],
                grid: {
                  hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                   content: function(label, xval, yval, flotItem) {
                        x = new Date(xval);
                        shortTime = x.getHours() + ':' + x.getMinutes();
                        return 'Day ' + xval + '  | ' + yval + ' ' + $rootScope.getEinheiten($rootScope.GlobalData.config.volumemessurement);
                    },
                    onHover: function (flotItem, $tooltipEl) {
                    }
                }
            };
            //Ende MultiOptions

            vmCurvesTaxi.flotMultiData = [
                {
                    data:  diagramData,
                    points: {
                        show: true,
                    },
                    lines: {
                        show:true,
                        lineWidth: '3'
                    },
                    //label:  $rootScope.getEinheiten($rootScope.GlobalData.config.volumemessurement)
                },

            ];

            vmCurvesTaxi.flotMultiOptions = multiOptions;

        };
        init();
    }
})();
