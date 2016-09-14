(function ($) {
    var _log = window._log = function (s) {
        console.log(s)
    };
    var inItems = window.inItems = function (needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i].caption == needle) return true;
        }
        return false;
    };
    var root = 'http://evaltool.rainbat.ch/esi2/';
    //var rootXML = 'http://192.168.1.86/project/evaltool/app/xmls/';
    var rootXML = 'http://64.27.56.41/~dev6iflair/evaltool/xmls/';
    var rootURL = root + 'xml2.php';
    var vorlagenURL = root + 'vorlagen.php';

    var app = angular.module('evaltool', ['ngScrollbars', 'ngDragDrop', 'angularJqueryUiAccordion', 'inline', 'ngAnimate']);

    app.directive('loading', ['$http','$timeout', function ($http,$timeout) {
        return {
            restrict: 'A',
            link: function (scope) {
                scope.isLoading = function () {
                    return $http.pendingRequests.length > 0;
                };
                scope.$watch(scope.isLoading, function (v) {
                    if (v) {
                        $('body').addClass('loading')
                    } else {
                        $timeout(function () {
                            $('body').removeClass('loading')
                        },700);

                    }
                });
            }
        };
    }]);
    app.directive('contenteditable', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                // view -> model
                elm.bind('blur', function () {
                    scope.$apply(function () {
                        ctrl.$setViewValue(elm.text());
                    });
                });
                // model -> view
                ctrl.render = function (value) {
                    elm.html(value);
                };
                // load init value from DOM
                ctrl.$setViewValue(elm.text());
                elm.bind('keydown', function (event) {
                    console.log("keydown " + event.which);
                    var esc = event.which == 27 || event.which == 13,
                        el = event.target;

                    if (esc) {
                        console.log("esc");
                        ctrl.$setViewValue(elm.text());
                        el.blur();
                        event.preventDefault();
                    }

                });
            }
        };
    });

    app.controller('Itempool', ['$scope','$sce', '$http', '$filter', '$q', '$rootScope', '$window', '$timeout', 'questionnaire','export', function ($scope, $sce, $http, $filter, $q, $rootScope, $window, $timeout, quest, exporter) {

        $scope.config = {
            autoHideScrollbar: true,
            theme: 'dark-thin',
            axis: "y",
            advanced: {
                updateOnContentResize: true
            },
            scrollInertia: 0
        };
        $scope.screens = ['Fragen zusammenstellen','Frageblöcke bearbeiten','Fragebogen fertigstellen','Befragung durchfuhren','Befragung auswerten'];
        $scope.currentScreen = 0;



        $scope.makeScreenActive = function (index) {
            $scope.currentScreen = index;
            $timeout(function () {
                angular.element($window).trigger('resize');
            },100)
        };

        // Default options for Itemloop
        var itemloops = [];
        itemloops.push({
            name: 'Itempool - Umgang mit Heterogenität',
            value: '0'
        }, {name: 'Itempool - Qualitätsmanagement (Q2E)', value: '1'}, {name: 'Itempool - Schulführung', value: '2'});
        $scope.itemloops = itemloops;
        $scope.itemed = $scope.itemloops[0].value || 0;



        // questions.type
        $scope.questions = [];

        $scope.$watch($scope.questions, function (v) {
            if($scope.questions.type == 'standard')  angular.element('#standardTemplates').trigger('ngRefresh');
        },true);

        $scope.standardnode = null;

        $scope.questionsTypeChange = function () {
            if ($scope.standardnode == null) {
                $scope.load_standard()
            }
            else {

            }
            _log($scope.questions.type);

            $timeout(function () {
                if($scope.questions.type == 'standard')  angular.element('#standardTemplates').trigger('ngRefresh');
                //angular.element($window).trigger('resize');
            },100)
        };

        // Load first default (Itempool - Umgang mit Heterogenit?t) xml data from server
        $http.get(rootURL + '?items=true')
            .success(function (response) {
                var $data = $.xml2json(response);
                $scope.nodes = $data.node.node;
            });

        // Load Itempool xml data on change of drop down
        var canceler;
        $scope.load_Itemloop = function (itemed) {
            var parmas = '&pool=' + itemed;
            if (canceler) canceler.resolve();
            canceler = $q.defer();
            $http({method: 'GET', url: rootURL + '?items=true' + parmas, timeout: canceler.promise})
                .success(function (response) {
                    var $data = $.xml2json(response);
                    $scope.nodes = $data.node.node;
                });
        };

        // Vorlagen: load options.
        $http.get(vorlagenURL)
            .success(function (response) {
                var $data = $.xml2json(response);
                $scope.vorlagens = $data.nodes.node;
                $scope.standard = $scope.vorlagens[0].$.value;
            });

        // Default options for 'Adressaten des Fragebogens'
        $scope.addressees = 'Lehrpersonen';
        $scope.selection = {};
        $scope.standardItem = {};
        $scope.selected_caption = '';

        // Fragebogens Counter
        $scope.getLenght = quest.getLenght;

        // Tree Functions
        $scope.showsub = function (node, e) {
            //_log(node.$.caption);
            $scope.selected_caption = node.$.caption;
            $(e.currentTarget).toggleClass('active');
            $(e.currentTarget).next('ul').slideToggle();
        };

        // Tree Selection function
        $scope.addToSelection = function (ele, e) {
            var lev1tit = $('.level-1-title');
            lev1tit.parent('li').removeClass('active');
            lev1tit.removeClass('active');
            //_log(ele.$.caption);
            $scope.selected_caption = ele.$.caption;
            $(e.currentTarget).parent('li').addClass('active');
            $(e.currentTarget).addClass('active');
            $scope.selection = $filter('filter')(ele.item, {'perspektive': $scope.addressees});
        };


        // Verwendung von Standardfragebogen - standard questionnaires
        $scope.load_standard = function () {
            //_log($scope.standard);
            var parmas = $scope.standard + '.xml';
            if (canceler) canceler.resolve();
            canceler = $q.defer();
            $http({method: 'GET', url: rootXML + parmas, timeout: canceler.promise})
                .success(function (response) {
                    //console.log($data.node.node);
                    // _log($data);
                    $scope.standardnode = $.xml2json(response);
                    $scope.questionnaire.title = $scope.standardnode.project.titel;
                    $scope.questionnaire.introduction = $scope.standardnode.project.einleitung;
                    $scope.questionnaire.remarks = $scope.standardnode.project.abschluss;
                    $timeout(function () {
                        $scope.markAsSelected($scope.standardnode.project.bloecke.block[0].$.name);
                        angular.element('#standardTemplates').trigger('ngRefresh')
                    }, 500)

                });
        };

        $scope.getItemByGroup = function (e) {
            return quest.getItemByGroup(e, $scope.standardnode)
        };


        // Drag & drop
        $scope.selected = [];


        $scope.helperclone = function () {
            return jQuery(this).clone().appendTo('body').css({
                'zIndex': 5
            });
        };
        $scope.currentActiveTabIndex = 0;
        $scope.makeCurrentTabActive = function (item,$index) {
            $scope.currentInterviewTab = item;
            $scope.currentActiveTabIndex = $index;
        };


        $scope.beforeDrop = function (event, ui) {
            //_log(event)
            //_log(ui.helper.html())
            if (typeof $scope.currentInterviewTab == 'undefined') $scope.currentInterviewTab = $scope.interviews[0];
            var selected = $scope.currentInterviewTab.items;
            var temp = true;

            if(inItems(ui.helper.html(), selected)) temp = false;
            var deferred = $q.defer();

            if (temp) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
            return deferred.promise;
        };


        // Interview blocks

        $scope.skalas = $.xml2json(xml.Skalen);

        //_log($scope.skalas);
        $scope.filterSkala = function (skala) {
            return (skala.$.name == $scope.interviews[$scope.currentActiveTabIndex].skala);

        };
        $scope.addNewOption = function ($name,$nicht) {
            //_log($nicht);
            var $temp = $filter('filter')($scope.skalas.nodes.skala, function (value) {
                return value.$.name == $name
            });
            var extra = {$:{name:"weiss nicht", value:"99999"}, _:"", $$hashKey:"object:0"};
            if($nicht[$scope.interviews[$scope.currentActiveTabIndex].skala] == true){
                angular.forEach($scope.skalas.nodes.skala, function (v,n) {
                    if(v.$.name == $scope.interviews[$scope.currentActiveTabIndex].skala && v.wert[v.wert.length-1].$.value !== '99999' ) {
                        v.wert.push(extra);
                    }
                })
            }
            else {
                angular.forEach($scope.skalas.nodes.skala, function (v,n) {
                    if(v.$.name == $scope.interviews[$scope.currentActiveTabIndex].skala) {
                        v.wert.splice(v.wert.length-1,1);
                    }
                })
            }

        };
        $scope.isHasNicht = function($name){
            var $temp = $filter('filter')($scope.skalas.nodes.skala, function (value) {
                return value.$.name == $name && value.wert[value.wert.length-1].$.value == '99999';
            });
        };
        $scope.interviews = [];
        $scope.interviews.push({
            $: {name:'Befragungsblock 1'},
            titel: '',
            skala: 'Skala 4: stimmt',
            einleitung: '',
            items: []
        });
        $scope.deleteSelectedTab = function (type) {
            switch (type){
                case 'interview':
                    if($scope.interviews.length > 1) {
                        $scope.interviews.splice($scope.currentActiveTabIndex,1);
                        if(typeof $scope.interviews[$scope.currentActiveTabIndex] == 'undefined'){
                            $scope.currentActiveTabIndex = $scope.currentActiveTabIndex-1
                        }
                        angular.element('#interviews').trigger('ngRefresh');
                    }
                    break;
                case 'grouping':
                    if($scope.groupings.length > 1) {
                        $scope.groupings.splice($scope.currentGroupingsTabIndex,1);
                        if(typeof $scope.groupings[$scope.currentGroupingsTabIndex] == 'undefined'){
                            $scope.currentGroupingsTabIndex = $scope.currentGroupingsTabIndex-1
                        }
                        angular.element('#grouping').trigger('ngRefresh');
                    }
                    break;
            }


        }
        $scope.addInterviews = function () {
            //_log('added!!')
            $scope.interviews.push({
                $: {name:'Befragungsblock '+($scope.interviews.length+1)},
                titel: '',
                skala: 'Skala 4: stimmt',
                einleitung: '',
                items: []
            });
            $scope.currentActiveTabIndex = $scope.interviews.length - 1;
            $scope.currentInterviewTab = $scope.interviews[$scope.currentActiveTabIndex];

            angular.element('#interviews').trigger('ngRefresh');
            //angular.element($window).trigger('resize');
        };
        $scope.addItemToView = function () {
            var item = {
                caption: 'Eigenes Item',
                item_index: '0.0.0',
                perspektive: ''
            };

            if (typeof $scope.currentInterviewTab == 'undefined') $scope.currentInterviewTab = $scope.interviews[0];
            $scope.currentInterviewTab.items.push(item)

        };
        $scope.markAsSelected = function ($name) {
            $items = $scope.getItemByGroup($name);
            $scope.standardTempItem = $items;
        };
        $scope.addSheetToView = function () {
            if($scope.standardTempItem !== null){
                if (typeof $scope.currentInterviewTab == 'undefined') $scope.currentInterviewTab = $scope.interviews[0];
                angular.forEach($scope.standardTempItem, function (i,n) {
                    $scope.currentInterviewTab.items.push(i)
                });
            }

        };
        $scope.addEntireTemplateViews = function () {
            if($scope.standardnode !== null){
                $scope.interviews = [];
                angular.forEach($scope.standardnode.project.bloecke.block, function (i,n) {
                    //_log(i);
                    $scope.interviews.push(i);
                    var $items = $scope.getItemByGroup(i.$.name);
                    $scope.interviews[n].items = $items
                });
                angular.element('#interviews').trigger('ngRefresh');
                //angular.element($window).trigger('resize');
            }

        };
        $scope.clearItemsToView = function () {
            if (typeof $scope.currentInterviewTab == 'undefined') $scope.currentInterviewTab = $scope.interviews[0];
            $scope.currentInterviewTab.items = []
        };

        $( document ).tooltip({
            items: "[data-title]",
            content: function () {
                return $( this).data('title');
            }
        });

        /*
         * Help popup Setup
         * */
        $http.get(root + 'backend/proxy.php?url=http://www.evaltool.ch/support_esi/?feed=rss2')
            .success(function (response) {
                var $data = $.xml2json(response);
                $scope.help_text_feed = $data;

            });
        function getHelpObjectByName($link){
            return $filter('filter')($scope.help_text_feed.rss.channel.item, function (value) {
                return value.link == $link;
            })[0];
        }
        $scope.helpPopupTitle = '';
        $scope.helpPopupDiscription = '';
        $(document).on('click','[data-helppopup]', function () {

            var $that = $(this);
            var action = $that.data('helppopup');
            var $obj =  getHelpObjectByName(action);

            $scope.$apply(function () {
                $scope.helpPopupTitle = $obj["title"];
                $scope.helpPopupDiscription = $sce.trustAsHtml($obj["content:encoded"]);
            });
            $('#help-popup').fadeIn();
        });
        $('#help-popup').find('.close').on('click', function () {
            $('#help-popup').fadeOut();
        });

        /*
         * Screen 3
         * */

        $scope.VorlagenItems = $.xml2json(xml.Vorlagen);
        //_log($scope.VorlagenItems);

        $scope.questionnaire = [];
        $scope.questionnaire.title = '';
        $scope.questionnaire.introduction = '';
        $scope.questionnaire.remarks = '';

        $scope.groupings = [];
        $scope.groupings.push({
            $: {
                name:'Neue Gruppe',
                id: 'g0',
                frage: ''
            },
            wert: []
        });
        $scope.currentGroupTabIndex = 0;
        $scope.currentGroupingsTabIndex = 0;
        $scope.currentSelectedGroupTab = $scope.VorlagenItems.nodes.gruppe[0];

        $scope.currentGroupingsTab = $scope.groupings[0];

        $scope.makeCurrentGroupActive = function (item,$index) {
            $scope.currentGroupingsTab = item;
            $scope.currentGroupingsTabIndex = $index;
        };
        $scope.markGroupAsSelected = function ($index) {
            $scope.currentGroupTabIndex = $index;
            $scope.currentSelectedGroupTab = $scope.VorlagenItems.nodes.gruppe[$index];
        };
        $scope.fieldsItemDelete = [];
        $scope.ItemDelete = [];
        $scope.deleteOnDrop = function (event, ui) {
            var deferred = $q.defer();
            deferred.resolve();
            $timeout(function () {
                $scope.fieldsItemDelete = [];
                $scope.ItemDelete = [];
            },100);

            return deferred.promise;
        };
        $scope.beforeDropGroup = function (event, ui) {
            //_log(event)
            //_log(ui.helper.html())
            var selected = $scope.currentGroupingsTab.wert;
            //_log(selected);
            var temp = true;

            if(inItems(ui.helper.html(), selected)) temp = false;
            var deferred = $q.defer();
            //_log(deferred);

            if ($scope.groupings.length == 1 && $scope.groupings[0].wert.length == 0) {
                $scope.groupings[0] = angular.copy($scope.currentSelectedGroupTab);
                angular.element('#grouping').trigger('ngRefresh');
                //angular.element($window).trigger('resize');
                temp = false
            }
            else {
                temp = hasGroupings()
            }


            if (temp) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
            return deferred.promise;
        };
        function hasGroupings(){
            var filtered = $filter('filter')($scope.groupings, function (v) {
                _log(v);
                return v.$.name == $scope.currentSelectedGroupTab.$.name;
            });

            if(filtered.length > 0) {
                return true
            }
            else {
                $scope.groupings.push(angular.copy($scope.currentSelectedGroupTab));
                $scope.currentGroupingsTabIndex = $scope.groupings.length - 1
                angular.element('#grouping').trigger('ngRefresh');
                //angular.element($window).trigger('resize');
                return false
            }
        }
        angular.element($window).on('load', function () {
            angular.element($window).trigger('resize');
        });
        $scope.doPDF = function () {
            exporter.groupings = $scope.groupings;
            exporter.questionnaire = $scope.questionnaire;
            exporter.interviews = $scope.interviews;
            exporter.skalen = $scope.skalas;
            exporter.PDF()
        };
        $scope.doHTML = function () {
            exporter.groupings = $scope.groupings;
            exporter.questionnaire = $scope.questionnaire;
            exporter.interviews = $scope.interviews;
            exporter.skalen = $scope.skalas;
            exporter.HTML()
        };


    }])
        .factory('questionnaire', ['$window', '$filter', function (win, $filter) {
            var quest = {};
            quest.getLenght = function ($v, $ad) {
                var $temp = $filter('filter')($v, {'perspektive': $ad});
                return $temp.length;
            };
            quest.getItemByGroup = function ($fil, $array) {

                var items = $array.project.items.item;

                return $filter('filter')(items, function (value) {
                    return value.$.block == $fil
                });
            };
            return quest;
        }])
        .factory('export', ['$window', '$filter','$http', function (win, $filter,$http) {
            var exporter = function () {
                this.groupings =  null;
                this.questionnaire = null;
                this.interviews = null;
                this.skalen = null;
            };
            exporter.prototype = {
                verify: function () {
                    return this.groupings != null || this.questionnaire != null || this.interviews != null;
                },
                replaceAllNewlines: function(hay, repl) {
                    if( hay != null ){
                        hay = this.replaceAll(hay, "\r\n", "\n"); // replace all CRLF by LF
                        hay = this.replaceAll(hay, "\r", "\n"); // replace CR by LF
                        hay = this.replaceAll(hay, "\n", repl); // replace LF by repl
                    }
                    return hay;
                },
                replaceAll: function (hay, needle, repl) {
                    return hay.split(needle).join(repl);
                },
                PDF: function(){
                    if(!this.verify()) return;
                    // ToDo: Error solve for doc file.
                    this.HTML('preview');
                },
                HTML: function ($type) {
                    if(!this.verify()) return;
                    var self = this;
                    var html_text_style ="";
                    var html_text_combo ="";
                    var html_text_check ="";
                    var html_text_title ="";
                    var html_text_items ="";
                    var html_text_form ="";

                    html_text_style += "<style>";
                    html_text_style += "body {";
                    html_text_style += "	font-family:Verdana;";
                    html_text_style += "	font-size:12px;";
                    html_text_style += "	background-color: #FFFFFF;";
                    html_text_style += "}";
                    html_text_style += "a:link {";
                    html_text_style += "	text-decoration: none;";
                    html_text_style += "}";
                    html_text_style += "a:visited {";
                    html_text_style += "	text-decoration: none;";
                    html_text_style += "}";
                    html_text_style += "a:hover {";
                    html_text_style += "	text-decoration: none;";
                    html_text_style += "	color: #FFFF00;";
                    html_text_style += "}";
                    html_text_style += "a:active {";
                    html_text_style += "	text-decoration: none;";
                    html_text_style += "}";
                    html_text_style += "table {";
                    html_text_style += "	border:0;";
                    html_text_style += "	cellpadding: 12;";
                    html_text_style += "}";
                    html_text_style += "td,p{";
                    html_text_style += "	font-family:Verdana;";
                    html_text_style += "	font-size:12px;";
                    html_text_style += "}";
                    html_text_style += "td.caption{";
                    html_text_style += "	font-family:Verdana;";
                    html_text_style += "	font-size:12px;";
                    html_text_style += "	max-width: 180px;";
                    html_text_style += "}";
                    html_text_style += "h2,h1{";
                    html_text_style += "	font-family:Verdana;";
                    html_text_style += "	font-size:12px;";
                    html_text_style += "}";
                    html_text_style += "</style>";


                    html_text_title += "<h2>" + self.questionnaire.title + "</h2>";
                    html_text_title += "<br/>";
                    html_text_title += "<p>" + self.replaceAllNewlines( self.questionnaire.introduction, "<br>") + "</p>";

                    var counter                 = 0;
                    var taxo_caption            = "";
                    var taxo_einleitung         = "";
                    var previous_taxo_caption   = "";
                    var quellen                 = "";

                    html_text_combo += "<table>";
                    if (self.groupings[0].$.name != 'Neue Gruppe') {
                        for (n in self.groupings) {
                            var row = self.groupings[n];
                            html_text_combo += "<tr>";
                            html_text_combo += "<td>" + row.$.frage + "</td>";
                            html_text_combo += "<td align=left>";
                            html_text_combo += "<select name=\"" + row.$.id + "\">";
                            for (n in row.wert) {
                                var row2 = row.wert[n];
                                html_text_combo += "<option value=\"" + row2.$.name + "\">" + row2.$.name + "</option>";
                            }
                            html_text_combo += "</select>";
                            html_text_combo += "</td>";
                        }
                    }
                    html_text_combo += "</table>";


                    html_text_check += "<table>";
                    if (self.groupings[0].$.name != 'Neue Gruppe') { // ToDo: Error solve for doc file.
                        for (n in self.groupings) {
                            var row = self.groupings[n];
                            html_text_check += "<tr>";
                            html_text_check += "<td valign=top>" + row.$.frage + "</td>";
                            html_text_check += "<td valign=top>";

                            for (n in row.wert) {
                                var row2 = row.wert[n];
                                html_text_check += "<input type=\"checkbox\">" + row2.$.name + "<br/>";
                            }

                            html_text_check += "</td></tr>";
                            html_text_check += "<tr><td colspan=2><hr></td></tr>";

                        }
                    }
                    html_text_check += "</table>";



                    var cch = "";

                    for (n in self.interviews){
                        var row = self.interviews[n];
                        counter++;
                        //_log(row);

                        if(quellen.indexOf(row.titel)<0){
                            quellen += "<tr> ";
                            quellen += "<td colspan=7>" + row.titel + "</td>";
                            quellen += "</tr>";
                        }
                        //var tid  = row.qstid;
                        taxo_caption = row.einleitung;

                        taxo_caption = row.titel;
                        taxo_einleitung = self.replaceAllNewlines( row.einleitung,"<br/>");

                        if(taxo_caption!=previous_taxo_caption){
                            if(counter>1) html_text_items += "</table>";
                            html_text_items += "<br>";
                            html_text_items += "<table>";

                            html_text_items += "<tr>";
                            html_text_items += "<td colspan=7><b>" + taxo_caption + "</b></td>";
                            html_text_items += "</tr>";
                            html_text_items += "<tr>";
                            html_text_items += "<td colspan=7>" + taxo_einleitung + "</td>";
                            html_text_items += "</tr>";

                            //_log(self.skalen);
                            var cSkala = $filter('filter')(self.skalen.nodes.skala, function (v) {
                                return v.$.name == row.skala;
                            });
                            //_log(cSkala);
                            if (cSkala.length > 0) {
                                var num_val = cSkala[0].wert.length;
                            }
                            else {
                                num_val = 0;
                            }
                            //_log(num_val);

                            var tt ="";
                            for(var i=0;i<num_val;i++){
                                tt += cSkala[0].wert[i].$.value + "=" + cSkala[0].wert[i].$.name + "";
                                if(i<num_val-1) tt += ",";
                            }
                            //_log(tt);

                            tt = tt.replace("99999","weiss nicht");

                            html_text_items += "<tr>";
                            html_text_items += "<td colspan=7 align=left><i>" + tt + "</i></td>";
                            html_text_items += "</tr>";



                            html_text_items += "<tr>";
                            html_text_items += "<td width=70%>&nbsp;</td>";
                            for(var i=0;i<num_val;i++){
                                var skale_tmp = cSkala[0].wert[i].$.name;
                                var skale_val = cSkala[0].wert[i].$.value;
                                skale_tmp = skale_tmp.replace("+","%2B");
                                skale_tmp = skale_tmp.replace("+","%2B");
                                skale_tmp = skale_tmp.replace("+","%2B");
                                skale_tmp = skale_tmp.replace("ö","oe");
                                skale_tmp = skale_tmp.replace("ä","ae");
                                skale_tmp = skale_tmp.replace("ü","ue");
                                skale_tmp = skale_tmp.replace("Ö","Oe");
                                skale_tmp = skale_tmp.replace("Ä","Ae");
                                skale_tmp = skale_tmp.replace("Ü","Ue");

                                if(skale_tmp=="weiss nicht") {
                                    html_text_items += "<td width=25 align=center>&nbsp;</td>";
                                    //html_text_items += "<td width=5% align=center>" + skale_val + "</td>";
                                    html_text_items += "<td width=5% align=center>" + "weiss nicht" + "</td>";
                                }else{
                                    html_text_items += "<td width=5% align=center>" + skale_val + "</td>";
                                }
                                //html_text_items += "<td width=5% align=center><img src='text.php?text=" + skale_tmp + "'></td>";

                            }


                            html_text_items += "</tr>";
                            previous_taxo_caption=taxo_caption;

                        }


                        //_log(row)
                        for (n in row.items) {
                            var row2 = row.items[n];
                            //_log(row2)

                            var id  = row.$.qssid;
                            html_text_items += "<tr>";
                            if(cch=="CCE9FE"){
                                cch="ffE9ff";
                            } else {
                                cch="CCE9FE";
                            }

                            html_text_items += "<td width=450 bgcolor=\"#"+cch+"\">" + counter + ". " + row2.caption + "</td>";
                            if(row.skala=="Offene Antwort (ohne Skala)"){
                                html_text_items += "<td width=30% align=center bgcolor=\"#"+cch+"\"><input type=text name="+id+" size=30></td>";
                            }
                            else {
                                for (var i = 0; i < num_val; i++) {
                                    var skale_tmp = cSkala[0].wert[i].$.name;
                                    if (skale_tmp == "weiss nicht") {
                                        html_text_items += "<td width=25 align=center>&nbsp;</td>";
                                        html_text_items += "<td width=5% bgcolor=\"#ffE9ff\" align=center><input type=radio name=" + id + " value=" + cSkala[0].wert[i].$.value + "></td>";
                                    } else {
                                        html_text_items += "<td width=5% align=center bgcolor=\"#" + cch + "\"><input type=radio name=" + id + " value=" + cSkala[0].wert[i].$.value + "></td>";
                                    }
                                }
                            }
                        }




                        html_text_items += "</tr>";

                    }
                    html_text_items += "</table>";
                    //_log(html_text_items);

                    //construct the repply once token

                    html_text = '<?php $id="#project_id#"; include("once.php"); ?> \n';
                    html_text += html_text_style;
                    html_text += html_text_title;
                    html_text += '<form action="#project_id#i.php?once_code=<?php echo $_GET[\'once_code\'];?>" method=post>';
                    html_text += html_text_combo;
                    html_text += html_text_items;
                    html_text += "<br><input type=submit value='Antworten schicken'>";
                    html_text += "<input type=hidden name=project value=test />";
                    html_text += "<input type=hidden name=once_code value=\"<?php echo $_GET['once_code'];?>\" />";
                    html_text += "</form>";
                    html_text += "<p>" + self.questionnaire.remarks + "</p>";
                    html_text += "<br><br><br>";

                    php_tmp  = "<?php header(\"Content-type: application/vnd.ms-word; charset=utf-8\");";
                    php_tmp += "header(\"Content-Disposition: attachment; filename=Befragung.doc\");?>";
                    php_tmp += html_text_style;
                    php_tmp += html_text_title;
                    php_tmp += html_text_check;
                    php_tmp += html_text_items;
                    //hello
                    var myPattern = '/ö/g';
                    php_tmp = php_tmp.replace(myPattern,"&ouml;");
                    var myPattern = '/ä/g';
                    php_tmp = php_tmp.replace(myPattern,"&auml;");
                    var myPattern = '/ü/g';
                    php_tmp = php_tmp.replace(myPattern,"&uuml;");
                    //trace(php_tmp);
                    //php_tmp = php_tmp.replace("Ö","Oe");
                    //php_tmp = php_tmp.replace("Ä","Ae");
                    //php_tmp = php_tmp.replace("Ü","Ue");

                    //html_text += "<p>Quellen :</p>";
                    //html_text += "<table border=0 width=700>";
                    //html_text += quellen;
                    //html_text += "</table>";
                    var t = $type || 'previewHTML';
                    self.send(t,html_text,php_tmp);
                },
                send: function (type,html,php) {
                    $http({
                        method: 'POST',
                        url: 'http://evaltool.rainbat.ch/esi2/backend/backend.php',
                        headers: { 'Content-Type' : 'application/x-www-form-urlencoded' },
                        data: 'action='+type+'&tmp_id=0&html='+encodeURIComponent(html)+'&php='+encodeURIComponent(php)
                    })
                    .success(function (response) {
                        window.new = response
                        var win = window.open(response,'_blank')

                    });
                }

            };
            return new exporter();
        }]);

})(jQuery);
