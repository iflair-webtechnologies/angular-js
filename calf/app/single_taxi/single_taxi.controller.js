/*
    Controller für die Uebersichtsseite zu einem Taxi
  
*/
(function () {
    angular
        .module('calfguide')
        .controller('SingleTaxiController', SingleTaxiController);

    SingleTaxiController.$inject = ['$scope', '$rootScope', 'loadPlugin', 'SingleTaxiServices', '$interval', '$stateParams', '$window'];

    function SingleTaxiController($scope, $rootScope, loadPlugin, SingleTaxiServices, $interval, $stateParams, $window) {
        var vmSingleTaxi = this;
        vmSingleTaxi.id = $stateParams.taxi_id;  //Mein ausgewaehltes Taxi
        if($rootScope.GlobalData.taxis.length > 0) {
            $rootScope.GlobalData.taxis[0].taxi_id = $stateParams.taxi_id;
        }
        
        vmSingleTaxi.data = loadPlugin;  //Steuerung der Zeichnung Milchtaxi, On-OFF-Flag
        $scope.pressure_height = 0; //Beschriftung Pressure-Linie im Milchtaxi
        $scope.taxi_pressure = {  //CSS Pressure-Linie im Milchtaxi. Wird relativ berechnet anhand der Tabelle swget.pressure
            'height' : '0px'  //max-height in Firefox: 230px;
        }; 

        vmSingleTaxi.getTimer = getTimer; //Alle gespeicherten und noch nicht abgelaufenen Timer des Taxis

        vmSingleTaxi.process = '';  //Daten fuer das Chart  
        vmSingleTaxi.flotMultiData = []; //Container fuer die Daten des Charts

        var yPressureMax = 200;  //rechte Y-Achse;

 
        vmSingleTaxi.timerClock = $interval(function() {   //Timer zum Neuladen der Daten fuer das Chart
            reloadView();
        }, 6000 );
        $scope.$on("$destroy", function() {
            if (angular.isDefined(vmSingleTaxi.timerClock)) {
                $interval.cancel(vmSingleTaxi.timerClock);
            }
        });
 
        //Verlassen der Seite. Zuruecksetzen auf 60 sec
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
            SingleTaxiServices.changeElapseTime(vmSingleTaxi.id, 1);
        });


        vmSingleTaxi.getTaxis = getTaxis;  //Selectbox Taxiauswahl
        vmSingleTaxi.getTaxiConfig = getTaxiConfig;
        vmSingleTaxi.tempEinheit = '';


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
            SingleTaxiServices.changeTaxi(taxi_id).then(function (result) {
              if(result.errorcode == 1) {
               vmSingleTaxi.id = taxi_id;
                }
            });
        }

/*****************************************************************************
Funktion: getTaxiConfig
Aktion: Alle Config-Daten des Taxis laden

*******************************************************************************/
        function getTaxiConfig() {
            SingleTaxiServices.getTaxiConfig($stateParams.taxi_id).then(function (result) {
                for (var i in result.taxiconfig) {
                  if(result.taxiconfig[i].name === 'TempEinheit') {
                    vmSingleTaxi.tempEinheit = result.taxiconfig[i].value;
                  }
                }
            });
            
        }

/*****************************************************************************
Funktion: showChart
Aktion: Chart anzeigen
Parameter:
    data: aktuelle Tabellenzeile

*******************************************************************************/
        function showChart(data) {

            vmSingleTaxi.flotMultiOptions = {
                xaxis: 
                 {
                    show: true,
                    mode:"time",
                    ticks: 5,
                    timezone: 'browser',
                    timeformat: '%H:%M',
                },
                yaxes: [
                    {
                        min: 0,
                        max: parseInt(data.max) + 10,
                       
                    },
                    {
                        alignTicksWithAxis: 1,
                        show: true,
                        position: 'right',
                        min: 0,
                        max: yPressureMax,
                    }
                ],
                grid: {
                  hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem) {
                        x = new Date(xval);
                        shortTime = x.getHours() + ':' + x.getMinutes();
                        return shortTime + '  | ' + yval + ' ' + label;
                    },
                    onHover: function (flotItem, $tooltipEl) {
                  
                    }
                },
                legend: {
                    show:true,
                    container: '#chartFeeder',
                    placement: 'outsideGrid'
                },             
            };
            var tempEinheit = vmSingleTaxi.tempEinheit == 1 ? '11' : '13';  //Entweder Fahrenheit oder Celsius
            vmSingleTaxi.flotMultiData = [
                {
                    data: data.start, 
                    color: 'blue',
                    lines: {
                        show:true,
                        lineWidth: '3'
                    },
                    points: {
                        show: true,
                    },
                    yaxis: 1,
                    label:  $rootScope.getEinheiten(tempEinheit)
                },
                {
                    data: data.pressureChart,
                    lines: {
                        show:true,
                        lineWidth: '3'
                    },
                    points: {
                        show: true,
                    },
                    color: '#FF0000',
                    yaxis: 2,
                    label: $rootScope.getEinheiten($rootScope.GlobalData.einheiten.weightmessurement)
                }
            ];
        }
        
/*****************************************************************************
Funktion: getDataProcess
Aktion: Holen der Daten fuer das Chart
PHP-Datei: single_taxi/getDataProcess
Parameter: 
    vmSingleTaxi.id: die aktuelle TaxiID aus den $stateParams
Rueckgabe:
    result = [message, process[input, pressure, pressureChart, start, status, topftyp]]
*******************************************************************************/ 

        function getDataProcess() {
            SingleTaxiServices.getDataProcess(vmSingleTaxi.id).then(function (result) {
                if(result.status != 500) {
                    vmSingleTaxi.process = result.process;
                    var length = vmSingleTaxi.process.pressure.length;
                    if(vmSingleTaxi.process) {
                        getYPressure(vmSingleTaxi.process.topftyp[0]);
                        setTaxiPressure(vmSingleTaxi.process.pressure[length-1]);
                    }
                }
                showChart(vmSingleTaxi.process);
             });
  
        }
/*****************************************************************************
Funktion: getTimer()
Aktion: Timer / Aufgaben geplant: Alle Timer, die noch am aktuellen Tag folgen
PHP-Datei: single_taxi/getTimer.php
Parameter: 
    vmSingleTaxi.id: die aktuelle TaxiID aus den $stateParams
Rueckgabe:
    vmSingleTaxi.timer = [timerNummer, processNummer, Uhrzeit]
*******************************************************************************/ 
        function getTimer() {
            SingleTaxiServices.getTimer(vmSingleTaxi.id).then(function (result) {
                vmSingleTaxi.timer = result.data.myarray;
            });
        }

/*****************************************************************************
Funktion: getTaxis()
Aktion: Holt alle "meine" Taxis aus der Tabelle taxilist. Ergebnisse werden in die Dropdownbox geschrieben
PHP-Datei: single_taxi/taxilist.php
Parameter: 
   -
Rueckgabe:
    vmSingleTaxi.getTaxis = [taxi_id, version, last_seen, elapse_time, is_selected, live_flag, sdcard_flag, set_time]
*******************************************************************************/ 
        function getTaxis() {
            SingleTaxiServices.getTaxis($stateParams.taxi_id).then(function (result) {
                vmSingleTaxi.getTaxis = result.data.taxi;
            });
        }
        
/*****************************************************************************
Funktion: getYPressure()
Aktion: gibt die maximale Fuellmenge eines Taxis zurueck
Parameter: 
   topftyp: Topftyp des Taxis
Rueckgabe:
   Topfvolumen + 30 (l)
*******************************************************************************/ 
        function getYPressure(topftyp) {   
            if (topftyp == 0) {
                yPressureMax = 100 + 30;
            } 
            if (topftyp == 1) {
                yPressureMax = 150 + 30;
            } 
            if (topftyp == 2) {
                yPressureMax = 260 + 30;
            }
            return yPressureMax;
        }


/*****************************************************************************
Funktion: setTaxiPressure()
Aktion: berechnet die CSS-Eigenschaften, um die Fuellmenge des Taxis und das Label korrekt anzuzeigen
Parameter: 
   pressure: aktueller Fuellstand des Taxis 
Rueckgabe:
  
*******************************************************************************/ 
        function setTaxiPressure(pressure) {
            var maxPixel = 230;
           
            if(pressure && pressure != 0 || pressure != '') {
                var fillInProzent = pressure / ((yPressureMax )/100);  //Prozentuale Fuellmenge
                pressure_height = (maxPixel/100) * fillInProzent;
                $scope.taxi_pressure.height = pressure_height + 'px';
                //In der Datenbank kann ein Wert ueber der Max-Menge stehen, dann nur den Maximalwert anzeigen
                if(pressure > yPressureMax) {
                    $scope.pressure_height = yPressureMax;
                    $scope.taxi_pressure.height = $scope.pressure_height -40 + 'px';
                    console.log( $scope.pressure_height)
                } else {
                    $scope.pressure_height = pressure;
                }
            }
        }   

/*****************************************************************************
Funktion: reloadView()
Aktion: Automatischer Reload
  
*******************************************************************************/ 
        
        function reloadView() {
            SingleTaxiServices.getDataTaxi(vmSingleTaxi.id);
            getDataProcess();
            vmSingleTaxi.getTimer();
        }

        function init() {
            getDataProcess();
            vmSingleTaxi.getTaxis();
            vmSingleTaxi.getTimer();
            getTaxiConfig();
        }

        init();
       // reloadView();
       
    }
})();