/*
    Controller fuer die Futterkurven des Taxis

*/
(function () {
    angular
        .module('calfguide')
        .controller('CurvesController', CurvesController);

    CurvesController.$inject = ['$scope', '$rootScope', 'loadPlugin', 'CurvesServices',  '$state', '$stateParams', '$timeout', '$compile'];

    function CurvesController($scope, $rootScope, loadPlugin, CurvesServices, $state, $stateParams, $timeout, $compile) {

        var vmCurves = this;
        vmCurves.feedings = loadPlugin;  //Laden der Kalenderdaten und aller Fuetterungsdaten der letzten 7 Tage
        vmCurves.id = $stateParams.taxi_id;
        $rootScope.GlobalData.taxis[0].taxi_id = $stateParams.taxi_id;
        vmCurves.flotMultiData = [];
        $rootScope.currentTaxiId = vmCurves.id;
        $scope.taxi_id = vmCurves.id;

        vmCurves.getTaxis = getTaxis;
        vmCurves.showTable = true;  //Flag: Tabelle anzeigen oder nicht
        vmCurves.onlyErrorButton = false; //Flag: OnlyErrorButton ist gesetzt oder nicht
        //vmCurves.withoutErrorButton = true; //Flag: WithoutErrorbutton ist gesetzt


        var i = 0;

        vmCurves.filter = {   //Filter fuer die Tabelle. Wer soll angezgit werden
            pasteur: true,
            heat: true,
            cool: true,
            feed: true,
            reinigen: true
        };

        function getTaxiConfig() {
            CurvesServices.getTaxiConfig($stateParams.taxi_id).then(function (result) {
                for (var i in result.taxiconfig) {
                  if(result.taxiconfig[i].name === 'TempEinheit') {
                    vmCurves.tempEinheit = result.taxiconfig[i].value;
                  }
                }
            });

        }

//Beginn Calendar     siehe http://fullcalendar.io/
       $scope.uiConfig = {
            calendar: {
                //lang: 'de',
                height: 550,
                editable: false,
                header: {
                    left: 'onlyErrorButton',
                    center: 'title',
                    right: 'today basicDay,basicWeek,month prev,next, feedButton, pasteurizeButton, coolButton, heatButton, cleanButton'
                },
                timeFormat: 'H:mm',
                defaultView: 'month',
                titleFormat: 'DD MMMM YYYY',
                views: {
                    day: {
                        columnFormat: 'dddd D.M'
                    },
                    week: {
                        columnFormat: 'dd D.M'
                    },
                    month: {
                        columnFormat: 'dd',
                        titleFormat: 'MMMM'
                    }
                },
                loading: function( isLoading, view ) {
                  //alert('loading');
                        if(isLoading) {// isLoading gives boolean value
                            $('#wait').show();
                        } else {
                            //$('#wait').hide();
                        }
                  },
                theme: false,
                themeButtonIcons: false,
                customButtons: {
                    onlyErrorButton: {
                        text: $rootScope.getLabel('with_errors'),
                        click: function() {
                            $('.fc-onlyErrorButton-button').toggleClass('fc-state-active');
                            vmCurves.onlyErrorButton = false;
                            update_eventSources();
                        }
                    },
                    feedButton: {
                      text: "",
                      click: function(event) {
                        $('.fc-feedButton-button').toggleClass('fc-state-activeFeed');
                        if($('.fc-feedButton-button').hasClass('fc-state-activeFeed'))
                          vmCurves.filter.feed = false;
                        else
                          vmCurves.filter.feed = true;
                        $('.fc-onlyErrorButton-button').addClass('fc-state-active');
                        doFilters();
                      }
                    },
                    pasteurizeButton: {
                      text: "",
                      click: function(event) {
                        $('.fc-pasteurizeButton-button').toggleClass('fc-state-activePasteurize');
                        if($('.fc-pasteurizeButton-button').hasClass('fc-state-activePasteurize'))
                          vmCurves.filter.pasteur = false;
                        else
                          vmCurves.filter.pasteur = true;
                        $('.fc-onlyErrorButton-button').addClass('fc-state-active');
                        doFilters();
                      }
                    },
                    coolButton: {
                      text: "",
                      click: function(event) {
                        $('.fc-coolButton-button').toggleClass('fc-state-activeCool');
                        if($('.fc-coolButton-button').hasClass('fc-state-activeCool'))
                          vmCurves.filter.cool = false;
                        else
                          vmCurves.filter.cool = true;
                        $('.fc-onlyErrorButton-button').addClass('fc-state-active');
                        doFilters();
                      }
                    },
                    heatButton: {
                      text: "",
                      click: function(event) {
                        $('.fc-heatButton-button').toggleClass('fc-state-activeHeat');
                        if($('.fc-heatButton-button').hasClass('fc-state-activeHeat'))
                          vmCurves.filter.heat = false;
                        else
                          vmCurves.filter.heat = true;
                        $('.fc-onlyErrorButton-button').addClass('fc-state-active');
                        doFilters();
                      }
                    },
                    cleanButton: {
                      text: "",
                      click: function(event) {
                        $('.fc-cleanButton-button').toggleClass('fc-state-activeClean');
                        if($('.fc-cleanButton-button').hasClass('fc-state-activeClean'))
                          vmCurves.filter.reinigen = false;
                        else
                          vmCurves.filter.reinigen = true;
                        $('.fc-onlyErrorButton-button').addClass('fc-state-active');
                        doFilters();
                      }
                    },
                },

                dayClick: function(date, jsEvent, view) {

                    $scope.show_feeding_curves = false;
                    var x = new Date(date._d);
                    var y = x;
                    var start = y.setHours(0,0,0,0);
                    var end = x.setHours(23,59,59,59);

                    vmCurves.dateFrom =  new Date(start);
                    vmCurves.dateTo = new Date(end);

                    vmCurves.filter.pasteur = true;
                    vmCurves.filter.heat = true;
                    vmCurves.filter.cool = true;
                    vmCurves.filter.feed = true;
                    vmCurves.filter.reinigen = true;

                    CurvesServices.feedings($stateParams.taxi_id, start/1000, end/1000, 0, true,true,true,true,true, false, false).then(function (result) {
                        vmCurves.feedings = (result[0].data);
                        vmCurves.showTable = true;
                    });

                },
                eventClick: function(date, jsEvent, view) {

                    //alles zuruecksetzen
                    setVisibles();
                    var startTime = parseInt(date.startTimestamp) * 1000;
                    //1. Tabelle aktualisieren: Es sollen immer alle Fuetterungen des ganzen Tages angezeigt werden

                    //Zuerst den Tag holen aus startTimestamp
                    var x = new Date(startTime);
                    var y = x;

                    var start = y.setHours(0,0,0,0);  //dann die Start-Uhrzeit auf 0:0:0:0 setzen
                    var end = x.setHours(23,59,59,59);  //dann die End-Uhrzeit auf 23:59,59,59 setzen

                    vmCurves.dateFrom =  new Date(start);
                    vmCurves.dateTo = new Date(end);

                    var pasteur = true;
                    var heat = true;
                    var cool = true;
                    var feed = true;
                    var reinigen = true;

                    vmCurves.filter.pasteur = true;
                    vmCurves.filter.heat = true;
                    vmCurves.filter.cool = true;
                    vmCurves.filter.feed = true;
                    vmCurves.filter.reinigen = true;
                    CurvesServices.feedings(date.taxi_id, start/1000, end/1000, 0, heat, feed, cool , pasteur, reinigen).then(function (result) {
                        vmCurves.feedings = (result[0].data);
                    });

                    //2. Chart laden und direkt anzeigen
                    getCurves({ 'taxi_id':date.taxi_id , 'feeding_id':date.feeding_id, 'process_id' : date.process_id});
                    vmCurves.showTable = true;
                },
                eventRender: function(event, element, view ) {
                  i++;
                  if(i == 1) {
                    $('#wait').show();
                  }
                   // $('.fc-toolbar .fc-left .fc-onlyErrorButton-button').css({'background' : 'url("assets/media/img/automat_red.png") no-repeat', 'width' : '35px'}).attr('tooltip-placement', 'bottom');;
                    //$('.fc-toolbar .fc-left .fc-withoutErrorButton-button').css({'background' : 'url("assets/media/img/yellow.png") no-repeat', 'width' : '35px'});



                    $('.fc-day-grid-container').css('cursor', 'pointer'); //Setzt ueber jeden Tag den Cursor auf Pointer, um zu zeigen, dass alles klickbar ist

                    //Beim Laden per Hand die selbst gebauten Buttons setzen
                    if(vmCurves.onlyErrorButton === true) {
                        $('.fc-toolbar .fc-left .fc-onlyErrorButton-button').addClass('fc-state-active');
                    }
                    if(vmCurves.withoutErrorButton === true) {
                        $('.fc-toolbar .fc-left .fc-withoutErrorButton-button').addClass('fc-state-active');
                    }

                    //Tooltip fuer die selbst gebauten Buttons
                    $('.fc-toolbar .fc-left .fc-onlyErrorButton-button').tooltip({
                        'title' : $rootScope.getLabel('only_errors')
                    });
                    $('.fc-toolbar .fc-left .fc-withoutErrorButton-button').tooltip({
                        'title' : $rootScope.getLabel('without_errors')
                    });
                    $('.fc-feedButton-button').tooltip({ 'title': $rootScope.getLabel('fuettern') });
                    $('.fc-pasteurizeButton-button').tooltip({ 'title': $rootScope.getLabel('pasteurisieren') });
                    $('.fc-coolButton-button').tooltip({ 'title': $rootScope.getLabel('cool') });
                    $('.fc-heatButton-button').tooltip({ 'title': $rootScope.getLabel('heat') });
                    $('.fc-cleanButton-button').tooltip({ 'title': $rootScope.getLabel('reinigen') });


                    //Tooltip fuer alle Events. String zusammensetzen. Img hinzufügen
                    var action = event.action ? $rootScope.getLabel(event.action.toLowerCase() ) : $rootScope.getLabel('fuettern');
                    var startTime = event.startTime ? event.startTime : '-';
                    var endTime = event.endTime ? event.endTime : '-';
                    var amount = event.amount ? event.amount : '-';
                    var dosings = event.dosings ? event.dosings : '-';
                    var action_img = event.action ? event.action : 'fuettern';

                    //Image hinzufügen
                    img_src = "assets/media/img/" + action_img.toLowerCase() + ".png";

                    if(view.name === 'basicDay') {
                        element.find(".fc-time")
                            .before($("<span class=\"fc-event-icons\"></span>")
                                .html("<img src='" + img_src +   "' style=\"width:7%; float:left\" />"));
                        element.find(".fc-title").html(action);
                        element.find(".fc-time").css({'padding-left' : '20px'});
                    } else {
                        element.find(".fc-time")
                            .before($("<span class=\"fc-event-icons\"></span>")
                                .html("<img src='" + img_src +   "' style=\"width:30%; float:left\" />"));
                        element.find(".fc-time").css({'padding-left' : '20px'});
                        element.find(".fc-title").html(action);
                        element.find(".fc-title").hide();
                        // if (view.name == 'month' && (event.start.month != view.start.month)){
                        //     element.find(".fc-time").addClass("TEST");
                        // }

                        var moment = $('#calendar').fullCalendar('getDate');

                        element.find(".fc-event").addClass("TEST!_" + moment.format("MMMM") + "_" + event.start.format("MMMM"));

                    }

                    //Hintergrundfarbe setzen
                    var bgcolor = event.action == 'Pasteurisieren' ? '#42ca00' : event.action == 'Heizen' ? '#fa8072' : event.action == 'Kuehlen' ? '#00bfff' : event.action == 'reinigen' ? '#00baaa' : '#ffd700';
                    $(element).css('background-color', bgcolor);

                    //Tooltip setzen
                    if(view.name !== 'basicDay') {
                        var tooltipText =  $rootScope.getLabel('action') + ': ' + action  + ' | '  + $rootScope.getLabel('start') + ': '+ startTime + ' | ' + $rootScope.getLabel('end') + ': ' + endTime;
                        if(event.amount || event.dosings) { //Feeder.Dort gibt es noch Amount und Dosings
                            tooltipText +=  ' | ' + 'Liter: ' + amount + ' | ' + 'Dosierung: ' + dosings;
                        }
                    }

                    //Tooltip-Eigenscchaften
                    //$timeout(function() {
                        $(element).attr('tooltip-placement', 'bottom');  //Tooltip nach unten
                        $(element).tooltip({
                            'title': tooltipText,
                            'container': 'body',
                            'placement' : 'bottom'
                        });
                        $compile(element)($scope);
                    // });

                    if(view.name !== 'basicDay' && (moment.format("MMMM") != event.start.format("MMMM"))) {
                        element.find(".fc-content").addClass("othermonth");
                    }

                    //$('#wait').hide();
                },
                eventAfterAllRender:function(view){
                  //alert('loading end');
                  i = 0;
                  $('#wait').hide();
                },
            },
        };
        $scope.eventSources = [];
        $scope.eventSources = [loadPlugin.calendar_process]; //muss Array in Array sein


        $scope.gotoTable = function(){
          var height = $('#tbl').offset();
          $("html,body").animate({scrollTop: height.top},"slow");
        }

        $scope.gotoChart = function(){
          var height = $('#chart').offset();
          $("html,body").animate({scrollTop: height.top},"slow");
        }

/*****************************************************************************
Funktion: update_eventSources
Aktion: Ueberpruefen, welche Buttons gesetzt sind. Dann alle alten Events loeschen und den Kalendar neuzusammenbauen
Parameter:
  -
Rueckgabe:
   -
*******************************************************************************/
        function update_eventSources() {
          //alert('loading');
          $('#wait').show();
          var pasteur = vmCurves.filter.pasteur;
          var heat = vmCurves.filter.heat;
          var cool = vmCurves.filter.cool;
          var feed = vmCurves.filter.feed;
          var reinigen = vmCurves.filter.reinigen;

            var buttonleft = $('.fc-onlyErrorButton-button').hasClass('fc-state-active');
            var buttonright = $('.fc-withoutErrorButton-button').hasClass('fc-state-active');
            CurvesServices.feedings($stateParams.taxi_id, '', '', 0, heat, feed, cool , pasteur, reinigen, buttonleft, buttonright).then(function (result) {
              angular.element('#calendar').fullCalendar('removeEventSource', loadPlugin.calendar_process);
              angular.element('#calendar').fullCalendar('removeEventSource', result[0].data.calendar_process);
              angular.element('#calendar').fullCalendar('removeEventSource', loadPlugin.calendar_feeder);
              angular.element('#calendar').fullCalendar('removeEventSource', result[0].data.calendar_feeder);


               angular.element('#calendar').fullCalendar('addEventSource', result[0].data.calendar_process);
               angular.element('#calendar').fullCalendar('refetchEvents');
               angular.element('#calendar').fullCalendar('addEventSource', result[0].data.calendar_feeder);
               angular.element('#calendar').fullCalendar('refetchEvents');
            });
        }

//Ende Calendar

/*****************************************************************************
Funktion: $scope.showChart
Aktion: Klick auf eine Tabellenzeile. Holen der Daten fuer das Chart aus der aktuellen Tabellenzeile. Hervorheben der angeklickten Tabellenzeile ueber selectedIndex
Parameter:
    data.index: aktuelle $index-Variable der Tabellenzeile
    data.taxi_id: aktuelle TaxiID
    data.feeding_id: FuetterungsID der Tabellenzeile, '' wenn Process
    data.process_id: ProcessID der Tabellenzeile, '' wenn Fuetterung
Rueckgabe:
   -
*******************************************************************************/
        $scope.showChart = function(data) {
            //$scope.selectedIndex = data.index;  //setzt die Klasse .active im CSS auf die ausgewaehlte Tabellenzeile
            getCurves(data);
        }

/*****************************************************************************
Funktion: $scope.submitForm
Aktion: Lupensymbol startet die Suche nach einem bestimmten Datum. Ergebnisse werden in die Tabelle #feederTable geschrieben (vmCurves.feedings)
PHP-Datei: get_feedings_for_taxi_id.php
Parameter:
    taxi_id: die aktuelle TaxiID aus den $stateParams
    date_from: linkes Input-Date-Feld, Datumseingabe von
    date_to: rechtes Input-Date-Feld, Datumseingabe rechts
    heat: Checkbox Heizen
    feed: Checkbox Füttern
    cool: Checkbox Kühlen
    pasteur: Checkbox Pasteurisieren
    Reinigen: Checkbox Reinigen
Rueckgabe:
    vmCurves.feedings.feedings = [amount, date, dosings, end, endTime, endTimestamp, id, start, startTime, startTimestamp, taxi_id]
*******************************************************************************/
        $scope.submitForm = function() {
            setVisibles();
            var taxi_id = vmCurves.id;
            var date_from = parseInt(Math.floor(vmCurves.dateFrom.getTime()/1000));
            var date_to = parseInt(Math.floor(vmCurves.dateTo.getTime()/1000));

            CurvesServices.feedings( taxi_id, date_from, date_to, 0, true, true, true, true, true  ).then(function (result) {
                vmCurves.feedings = result[0].data;
            });
        };

/*****************************************************************************
Funktion: $scope.doFilter
Aktion: Setzen der Filter und Anpassen der Suchkriterien anhand der Filter
Parameter:
  item: feed | cool | heat | pasteur | Reinigen
Rueckgabe:
    vmCurves.feedings.feedings = [amount, date, dosings, end, endTime, endTimestamp, id, start, startTime, startTimestamp, taxi_id]
*******************************************************************************/
        var doFilters = function() {
            var taxi_id = vmCurves.id;
            var date_from = parseInt(Math.floor(vmCurves.dateFrom.getTime()/1000));
            var date_to = parseInt(Math.floor(vmCurves.dateTo.getTime()/1000));

            //Filter setzen
            /*for(var i in vmCurves.filter) {
                if(item == i) {
                    vmCurves.filter[i] == true ? vmCurves.filter[i] = false : vmCurves.filter[i] = true;
                }
            }*/
            var heat = vmCurves.filter.heat;
            var feed = vmCurves.filter.feed;
            var cool = vmCurves.filter.cool;
            var pasteur = vmCurves.filter.pasteur;
            var reinigen = vmCurves.filter.reinigen;

            CurvesServices.feedings( taxi_id, date_from, date_to, 0, heat, feed, cool, pasteur, reinigen ).then(function (result) {
                vmCurves.feedings = result[0].data;
                update_eventSources();
            });
        }


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
            CurvesServices.changeTaxi(taxi_id).then(function (result) {
                if(result.errorcode == 1) {
                    vmCurves.id = taxi_id;
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
    vmCurves.getTaxis = [taxi_id, version, last_seen, elapse_time, is_selected, live_flag, sdcard_flag, set_time]
*******************************************************************************/
        function getTaxis() {

            CurvesServices.getTaxis($stateParams.taxi_id).then(function (result) {
                vmCurves.getTaxis = result.data.taxi;
            });
        }


/*****************************************************************************
Funktion: setDate()
Aktion:  Initials fuer die Datumsfelder. DateFrom soll sieben Tage vor dem aktuellen Tag liegen, DateTo das aktuelle Datum haben
Parameter:
   -
Rueckgabe:
    -
*******************************************************************************/
        function setDate() {
           vmCurves.dateFrom = new Date( new Date().getTime() - (24*7 * 60*60 * 1000) ); //Sieben Tage vor heute
           vmCurves.dateTo = new Date();
        }

/*****************************************************************************
Funktion: setVisibles()
Aktion: Hided das Chart (show_feeding_curves), hided die Fehlermeldung, wenn keine Chartdaten vorhanden sind(show_error_text), setzt die .active-Classe auf -1
Parameter:
   -
Rueckgabe:
    -
*******************************************************************************/
        function setVisibles() {
            $scope.show_feeding_curves = false;  //Wenn Daten vorhanden und nicht Objekt nicht leer, dann auf true
            $scope.show_error_text = false; //Wenn keine Daten vorhanden sind, dann auf true
            //$scope.selectedIndex = -1; //setzt die Klasse "active" auf die ausgewaehlte Tabellenzeile
            $scope.leftYLabel = '';
        }

/*****************************************************************************
Funktion: getCurves()
Aktion: Chart-Daten laden und Anzeige-Optionen setzen (Chart  anzeigen, wenn Daten vorhanden sind, ansonsten Fehlermeldung anzeigen)
PHPDatei: curves.php
Parameter:
    data.index: aktuelle $index-Variable der Tabellenzeile
    data.taxi_id: aktuelle TaxiID
    data.feeding_id: FuetterungsID der Tabellenzeile
Rueckgabe:
   result = [data_curves[amount, temperature, label] , message, status]
*******************************************************************************/
        function getCurves(data) {
            CurvesServices.getCurves(data).then(function (result) {
               if(result.status != 300 || result.errorcode != 2) {  //Daten sind da und Objekt ist nicht leer
                    getDataCurves(result.data_curves);
                    $scope.show_feeding_curves = true;
                    $scope.show_error_text = false;
               } else {
                    $scope.show_feeding_curves = false;
                    $scope.show_error_text = true;
               }
            });
        }

/*****************************************************************************
Funktion: getDataCurves()
Aktion: Verarbeiten der Daten fuer das Chart, Chartinitials. X-Achse: Zeit, Y-Achse-links: Amount, Y-Achse rechts: Temperature
Parameter:
    data.amount: Balkendiagramm Amount
    data.temperature: Liniendiagramm Temperaturkurve
    data.label: Box-Id oder ''
Rueckgabe:
  -
*******************************************************************************/

        function getDataCurves(data) {
          var id = $rootScope.GlobalData.config.tempmessurement;
          for(i = 0; i <= data.temperature.length; i++){
            angular.forEach(data.temperature[i], function(value, key){
              if(key == 1){
                data.temperature[i][key] = $rootScope.calcunits(13, id, value)
              }
            })
          }
            var data_temperature = data.temperature;
            var position = 'right';

            vmCurves.flotMultiOptions = {
                xaxis:
                 {
                    show: true,
                    mode:"time",
                    ticks: 5,
                    timezone: 'browser',
                    timeformat: '%H:%M'
                },
                yaxes: [
                     {
                        alignTicksWithAxis: 1,
                        show: true,
                        position: position,
                        min: 0
                    },
                    {
                        min: 0,
                    }
                ],
                legend: {
                    show:true,
                    container: '#chartFeeder',
                    placement: 'outsideGrid'
                },
                colors: ["#1ab394"],
                grid: {
                  hoverable: true
                },
                tooltip: true,
                tooltipOpts: {
                    content: function(label, xval, yval, flotItem) {
                      x = new Date(xval);
                      shortTime = x.getHours() + ':' + x.getMinutes();
                      return shortTime  + '  | ' + yval + ' ' + label;
                    },
                    onHover: function (flotItem, $tooltipEl) {
                    }
                }
            };

            var tempEinheit = vmCurves.tempEinheit == 1 ? '11' : '13';
            vmCurves.flotMultiData = [
                {
                    label: $rootScope.getEinheiten($rootScope.GlobalData.config.tempmessurement),
                    data: data_temperature,
                    lines: {
                        show:true,
                        lineWidth: '3'
                    },
                    points: {
                        show: true,
                    },
                    color: 'red',
                    yaxis: 2,
                }
            ];

            //Feeding
            if (data.amount) {
                $scope.leftYLabel = $rootScope.getLabel('amount');
                $scope.amountLabel = $rootScope.getEinheiten($rootScope.GlobalData.einheiten['1']);

                vmCurves.flotMultiData.push({
                    label: $rootScope.getEinheiten($rootScope.GlobalData.einheiten['1']),
                    bars: {
                        show:true,
                        barWidth: 24,
                        fill: true,
                        fillColor: {
                            colors: [
                                {
                                    opacity: 0.8
                                },
                                {
                                    opacity: 0.8
                                }
                            ]
                        }
                    },
                    yaxis: 1,
                    data: data.amount
                });
            }
            //Process
            if (data.pressure) {
                $scope.leftYLabel = $rootScope.getLabel('pressure'),
                $scope.amountLabel = $rootScope.getLabel('bar');
                vmCurves.flotMultiData.push({
                   label:$rootScope.getLabel('bar'),
                   data: data.pressure,
                   lines: {
                        show: true,
                        lineWidth: '3',
                   },
                   points: {
                        show: true
                   },
                   yaxis: 1
                });
            }

        }



        function initme() {
            setDate();
            getTaxis();
            setVisibles();
            $timeout(function () {
              $('.fc-onlyErrorButton-button').addClass('fc-state-active');
              $('.fc-editErrorButton-button').removeClass('fc-state-default');
              $('.fc-editErrorButton-button').addClass('btn btn-primary');
            }, 5);

        }

        initme();
    }



})();
