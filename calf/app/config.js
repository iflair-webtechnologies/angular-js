function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $locationProvider) {

    $urlRouterProvider.otherwise("/dashboard");
    $locationProvider.html5Mode(true);

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
    // HomeScreen
        .state('dashboard', {
            url:          '/dashboard',
            templateUrl:  'views/dashboard/dashboard.html',
            controller:   'DashboardController',
            controllerAs: 'vmDashboard',
            data: { pageTitle: 'Dashboard' },
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                    return $ocLazyLoad.load([
                        {name: 'calfguide', files: ['app/dashboard/dashboard.controller.js', 'app/dashboard/dashboard.services.js']}
                    ]).then(function() {
                        var DashboardServices = $injector.get("DashboardServices");
                        return DashboardServices.getData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Automatenliste
        .state('feederList', {
            url:          '/feeder',
            templateUrl:  'views/feeder/list.html',
            controller:   'FeederListController',
            controllerAs: 'vmFeederList',
            data: { pageTitle: 'automat'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                    return $ocLazyLoad.load([
                        {serie: true, files: ['assets/js/plugins/pdfmake/build/pdfmake.min.js', 'assets/js/plugins/pdfmake/build/vfs_fonts.js', 'assets/js/plugins/ui-grid/ui-grid.js']},
                        {insertBefore: '#loadBefore', files: ['assets/js/plugins/ui-grid/ui-grid.min.css', 'assets/css/diagramm.css']},
                        {name: 'calfguide', files: ['app/feeder/feeder.services.js', 'app/feeder/list.controller.js']}
                    ]).then(function() {
                        var FeederServices = $injector.get("FeederServices");
                        return FeederServices.getData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Automatendetails
        .state('feederDetail', {
            url:          '/feeder/:id',
            templateUrl:  'views/feeder/detail.html',
            controller:   'FeederDetailController',
            controllerAs: 'vmFeederDetail',
            data: { pageTitle: 'info_automatendetails_header'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {serie: true, name: 'angular-flot',
                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                        },
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/feeder/feeder.services.js', 'app/feeder/detail.controller.js']}
                    ]).then(function() {
                        var FeederServices = $injector.get("FeederServices");
                        return FeederServices.getDetailData($stateParams.id).then(function (result) {
                            return result;
                        });
                    });
                }]
            }
        })
    // Kälberliste
        .state('calvesList', {
            url:          '/calves/list?feeder&alarm&anrecht',
            templateUrl:  'views/calves/list.html',
            controller:   'CalvesListController',
            controllerAs: 'vmCalvesList',
            data: { pageTitle: 'calfes'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                    return $ocLazyLoad.load([
                        {serie: true, files: ['assets/js/plugins/pdfmake/build/pdfmake.min.js', 'assets/js/plugins/pdfmake/build/vfs_fonts.js', 'assets/js/plugins/ui-grid/ui-grid.js']},
                        {insertBefore: '#loadBefore', files: ['assets/js/plugins/ui-grid/ui-grid.min.css']},
                        {name: 'calfguide', files: ['app/calves/calves.services.js', 'app/calves/list.controller.js']},
                        {files: ['assets/js/plugins/sparkline/jquery.sparkline.min.js']},
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']}
                    ]).then(function() {
                        var CalvesServices = $injector.get("CalvesServices");
                        return CalvesServices.getData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Kälberdetails
        .state('calvesDetail', {
            url:          '/calves/:id',
            templateUrl:  'views/calves/detail.html',
            controller:   'CalvesDetailController',
            controllerAs: 'vmCalvesDetail',
            data: { pageTitle: 'calfes'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {serie: true, name: 'angular-flot',
                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                        },
                        {name: 'calfguide', files: ['app/calves/calves.services.js', 'app/calves/detail.controller.js']}
                    ]).then(function() {
                        var CalvesServices = $injector.get("CalvesServices");
                        return CalvesServices.getDetailData($stateParams.id).then(function (result) {
                            return result;
                        });
                    });
                }]
            }
        })
    // Kälber bearbeiten
        .state('calvesEdit', {
            url:          '/edit',
            templateUrl:  'views/calves/edit.html',
            controller:   'CalvesEditController',
            controllerAs: 'vmCalvesEdit',
            data: { pageTitle: 'calfes'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {serie: true, files: ['assets/js/plugins/pdfmake/build/pdfmake.min.js', 'assets/js/plugins/pdfmake/build/vfs_fonts.js', 'assets/js/plugins/ui-grid/ui-grid.js']},
                        {insertBefore: '#loadBefore', files: ['assets/js/plugins/ui-grid/ui-grid.min.css']},
                        {files: ['assets/js/plugins/sparkline/jquery.sparkline.min.js']},
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/calves/calves.services.js', 'app/calves/edit.controller.js']}
                    ]).then(function() {
                        var CalvesServices = $injector.get("CalvesServices");
                        return CalvesServices.getEditData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Archivliste
        .state('archivesList', {
            url:          '/archives/list',
            templateUrl:  'views/archives/list.html',
            controller:   'ArchivesListController',
            controllerAs: 'vmArchivesList',
            data: { pageTitle: 'archive'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                    return $ocLazyLoad.load([
                        {serie: true, files: ['assets/js/plugins/pdfmake/build/pdfmake.min.js', 'assets/js/plugins/pdfmake/build/vfs_fonts.js', 'assets/js/plugins/ui-grid/ui-grid.js']},
                        {insertBefore: '#loadBefore', files: ['assets/js/plugins/ui-grid/ui-grid.min.css']},
                        {name: 'calfguide', files: ['app/archives/archives.services.js', 'app/archives/list.controller.js']},
                        {files: ['assets/js/plugins/sparkline/jquery.sparkline.min.js']},
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']}
                    ]).then(function() {
                        var ArchivesServices = $injector.get("ArchivesServices");
                        return ArchivesServices.getData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Archivdetails
        .state('archivesDetail', {
            url:          '/archives/:id',
            templateUrl:  'views/archives/detail.html',
            controller:   'ArchivesDetailController',
            controllerAs: 'vmArchivesDetail',
            data: { pageTitle: 'archive'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {serie: true, name: 'angular-flot',
                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                        },
                        {name: 'calfguide', files: ['app/archives/archives.services.js', 'app/archives/detail.controller.js']}
                    ]).then(function() {
                        var ArchivesServices = $injector.get("ArchivesServices");
                        return ArchivesServices.getDetailData($stateParams.id).then(function (result) {
                            return result;
                        });
                    });
                }]
            }
        })
    // Fehlerliste
        .state('errors', {
            url:          '/errors',
            templateUrl:  'views/errors/errors.html',
            controller:   'ErrorsController',
            controllerAs: 'vmErrors',
            data: { pageTitle: 'fehlerprotokolle'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {name: 'calfguide', files: ['app/errors/errors.services.js', 'app/errors/errors.controller.js']}
                    ]).then(function() {
                        var ErrorsServices = $injector.get("ErrorsServices");
                        return ErrorsServices.getData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // TodoListe
        .state('todosList', {
            url:          '/todos',
            templateUrl:  'views/todos/list.html',
            controller:   'TodosListController',
            controllerAs: 'vmTodosList',
            data: { pageTitle: 'todo'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        { name: 'datePicker', files: ['assets/css/plugins/datapicker/angular-datapicker.css','assets/js/plugins/datapicker/angular-datepicker.js']},
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/todos/todos.services.js', 'app/todos/list.controller.js', 'app/settings/settings.services.js']}
                    ]).then(function() {
                        var TodosServices = $injector.get("TodosServices");
                        return TodosServices.getListData().then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // TodoDetail
        .state('todosDetail', {
            url:          '/todos/:id',
            templateUrl:  'views/todos/detail.html',
            controller:   'TodosDetailController',
            controllerAs: 'vmTodosDetail',
            data: { pageTitle: 'todo'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/todos/todos.services.js', 'app/todos/detail.controller.js']}
                    ]).then(function() {
                        var TodosServices = $injector.get("TodosServices");
                        return TodosServices.getDetailData($stateParams.id).then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
    // Bidirektionaler Bereich
        .state('bi', {
            abstract:    true,
            url:         '/bi',
            templateUrl: 'views/bi/wrapper.html',
            data: { pageTitle: 'bidirect'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                    ]);
                }]
            }
        })
    //----  Bidirektional - Subframes
                .state('bi.login', {
                    url: '',
                    templateUrl:  'views/bi/login.html',
                    controller:   'BILoginController',
                    controllerAs: 'vmBILogin',
                    data:  {'last' : ''},
                    params: ['last'],
                    resolve: {
                        loadPlugin: ['$ocLazyLoad' , function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.login.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]);
                        }]
                    }
                })
                .state('bi.control', {
                    url: '/control',
                    templateUrl:  'views/bi/control.html',
                    controller:   'BIControlController',
                    controllerAs: 'vmBIControl',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', '$rootScope', '$state', function($ocLazyLoad, $injector, $rootScope, $state) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.control.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                } else {
                                    var BiServices = $injector.get("BiServices");
                                    return BiServices.getControlData().then(function (result) {
                                        return result;
                                    });
                                }
                            });
                        }]
                    }
                })
                .state('bi.conflict', {
                    url: '/conflict',
                    templateUrl:  'views/bi/conflict.html',
                    controller:   'BIConflictController',
                    controllerAs: 'vmBIConflict',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', '$rootScope', '$state', function($ocLazyLoad, $injector, $rootScope, $state) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.conflict.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                } else {
                                    var BiServices = $injector.get("BiServices");
                                    return BiServices.getConflictData().then(function (result) {
                                        return result;
                                    });
                                }
                            });
                        }]
                    }
                })
                .state('bi.calfIndividual_detail', {
                    url: '/ci/:id',
                    templateUrl:  'views/bi/calf_individual/ci.detail.html',
                    controller:   'BICalfIndividualDetailController',
                    controllerAs: 'vmBICIDetail',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', '$timeout', '$q', '$state', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $timeout, $q, $state, $stateParams, $rootScope) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/calf_individual/bi.ci.detail.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                } else {
                                    var BiServices = $injector.get("BiServices");
                                    return BiServices.getCILinks($stateParams.id).then(function (result) {
                                        if (result.status != 500) {
                                            return $q.when(result);
                                        } else {
                                            $timeout(function() {
                                                $state.go('dashboard');
                                            })

                                            return $q.reject();
                                        }
                                    });
                                }
                            });
                        }]
                    }
                })
                /* Unterseiten von Control (Calf Individual) Detail */
                        .state('bi.calfIndividual_detail.parameter', {
                            url: '/parameter',
                            templateUrl:  'views/bi/calf_individual/ci.parameter.html',
                            controller:   'BICalfIndividualParameterController',
                            controllerAs: 'vmBICIParameter',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {serie: true, name: 'angular-flot',
                                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                                        },
                                        {name: 'calfguide', files: ['app/bi/calf_individual/bi.ci.parameter.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getCIDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.calfIndividual_detail.wholemilk', {
                            url: '/wholemilk',
                            templateUrl:  'views/bi/calf_individual/ci.wholemilk.html',
                            controller:   'BICIWholemilkController',
                            controllerAs: 'vmBICIWholemilk',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {serie: true, name: 'angular-flot',
                                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                                        },
                                        {name: 'calfguide', files: ['app/bi/calf_individual/bi.ci.wholemilk.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getCIDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.calfIndividual_detail.additives', {
                            url: '/additives',
                            templateUrl:  'views/bi/calf_individual/ci.additives.html',
                            controller:   'BICIAdditivesController',
                            controllerAs: 'vmBICIAdditives',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/calf_individual/bi.ci.additives.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getCIDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.calfIndividual_detail.concentration', {
                            url: '/concentration',
                            templateUrl:  'views/bi/calf_individual/ci.concentration.html',
                            controller:   'BICIConcentrationController',
                            controllerAs: 'vmBICIConcentration',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/calf_individual/bi.ci.concentration.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getCIDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.feedingcurves', {
                            url: '/feedingcurves',
                            templateUrl:  'views/bi/feedingcurves.html',
                            controller:   'BIFeedingCurvesController',
                            controllerAs: 'vmBIFeedingCurves',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$rootScope', function($ocLazyLoad, $injector, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/bi.feedingcurves.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesData().then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.feedingcurves_detail', {
                            url: '/feedingcurves/:id',
                            templateUrl:  'views/bi/feedingcurves_detail/feedingcurves.detail.html',
                            controller:   'BIFeedingCurvesDetailController',
                            controllerAs: 'vmBIFeedingCurvesDetail',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$timeout', '$q', '$state', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $timeout, $q, $state, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/feedingcurves_detail/bi.feedingcurves.detail.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesLinks($stateParams.id).then(function (result) {
                                                if (result.status != 500) {
                                                    return $q.when(result);
                                                } else {
                                                    $timeout(function() {
                                                        $state.go('dashboard');
                                                    })

                                                    return $q.reject();
                                                }
                                            })
                                        }
                                    });
                                }]
                            }
                        })
                /* Unterseiten von Feedingcurves Detail */
                        .state('bi.feedingcurves_detail.parameter', {
                            url: '/parameter',
                            templateUrl:  'views/bi/feedingcurves_detail/feedingcurves.parameter.html',
                            controller:   'BICurveParameterController',
                            controllerAs: 'vmCurveParameter',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {serie: true, name: 'angular-flot',
                                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                                        },
                                        {name: 'calfguide', files: ['app/bi/feedingcurves_detail/bi.feedingcurves.parameter.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesDetailData($stateParams.id).then(function (result) {
                                                $stateParams.id = result.id;
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.feedingcurves_detail.wholemilk', {
                            url: '/wholemilk',
                            templateUrl:  'views/bi/feedingcurves_detail/feedingcurves.wholemilk.html',
                            controller:   'BICurveWholemilkController',
                            controllerAs: 'vmCurveWholemilk',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {serie: true, name: 'angular-flot',
                                         files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js']
                                        },
                                        {name: 'calfguide', files: ['app/bi/feedingcurves_detail/bi.feedingcurves.wholemilk.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.feedingcurves_detail.additives', {
                            url: '/additives',
                            templateUrl:  'views/bi/feedingcurves_detail/feedingcurves.additives.html',
                            controller:   'BICurveAdditivesController',
                            controllerAs: 'vmCurveAdditives',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/feedingcurves_detail/bi.feedingcurves.additives.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })
                        .state('bi.feedingcurves_detail.concentration', {
                            url: '/concentration',
                            templateUrl:  'views/bi/feedingcurves_detail/feedingcurves.concentration.html',
                            controller:   'BICurveConcentrationController',
                            controllerAs: 'vmCurveConcentration',
                            resolve: {
                                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$rootScope', function($ocLazyLoad, $injector, $stateParams, $rootScope) {
                                    return $ocLazyLoad.load([
                                        {name: 'calfguide', files: ['app/bi/feedingcurves_detail/bi.feedingcurves.concentration.controller.js']},
                                        {name: 'calfguide', files: ['app/bi/bi.services.js']}
                                    ]).then(function() {
                                        if ($rootScope.session === undefined) {
                                            $state.go('bi.login');
                                        } else {
                                            var BiServices = $injector.get("BiServices");
                                            return BiServices.getFeedingCurvesDetailData($stateParams.id).then(function (result) {
                                                return result;
                                            });
                                        }
                                    });
                                }]
                            }
                        })

                .state('bi.feedinggroups', {
                    url: '/feedinggroups',
                    templateUrl:  'views/bi/feedinggroups.html',
                    controller:   'BIFeedingGroupsController',
                    controllerAs: 'vmBIFeedingGroups',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', '$rootScope', function($ocLazyLoad, $injector, $rootScope) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.feedinggroups.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                } else {
                                    var BiServices = $injector.get("BiServices");
                                    return BiServices.getFeedingGroupsData().then(function (result) {
                                        return result;
                                    });
                                }
                            });
                        }]
                    }
                })
                .state('bi.backups', {
                    url: '/backups',
                    templateUrl:  'views/bi/backups.html',
                    controller:   'BIBackupsController',
                    controllerAs: 'vmBIBackups',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', '$rootScope', function($ocLazyLoad, $injector, $rootScope) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.backups.controller.js']},
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                } else {
                                    var BiServices = $injector.get("BiServices");
                                    return BiServices.getBackupData().then(function (result) {
                                        return result;
                                    });
                                }
                            });
                        }]
                    }
                })
                .state('bi.logout', {
                    url: '/backups',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$state', function($ocLazyLoad, $rootScope, $injector, $state) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/bi/bi.services.js']}
                            ]).then(function() {
                                var BiServices = $injector.get("BiServices");
                                BiServices.logout($rootScope.session);
                                $rootScope.session = undefined;
                                $state.go('dashboard', {}, { reload: true });
                                return true;
                            });
                        }]
                    }
                })

    //Taxi: Uebersicht einzelnes Taxi
        .state('single_taxi', {
            url:          '/single_taxi/:taxi_id',
            templateUrl:  'views/my_taxi/single_taxi.html',
            controller:   'SingleTaxiController',
            controllerAs: 'vmSingleTaxi',
            data: { pageTitle: 'mein_taxi' },
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', '$timeout', '$q', '$state',  function($ocLazyLoad, $injector, $stateParams, $timeout, $q, $state) {
                    return $ocLazyLoad.load([
                        {
                          serie: true,
                          name: 'angular-flot',
                          files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/angular-flot.js' ]
                        },
                        { name: 'calfguide', files: ['app/single_taxi/single_taxi.controller.js']},
                        { name: 'calfguide', files: ['app/single_taxi/single_taxi.services.js']},
                    ]).then(function() {
                        var SingleTaxiServices = $injector.get("SingleTaxiServices");

                        return SingleTaxiServices.getDataTaxi($stateParams.taxi_id).then(function (result) {
                            if (result.status != 500) {
                                return $q.when(result);
                            } else {
                                $timeout(function () {
                                    $state.go('all_taxis');
                                })
                            }

                            return $q.reject();
                        });
                    });
                }]
            }
        })

    //Taxi : Futterkuven
        .state('curves', {
            url:          '/curves/:taxi_id',
            templateUrl:  'views/my_taxi/curves.html',
            controller:   'CurvesController',
            controllerAs: 'vmCurves',
            data: { pageTitle: 'feeding_curve' },
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$stateParams', '$timeout', '$q', '$state', function($ocLazyLoad, $rootScope, $injector, $stateParams, $timeout, $q, $state) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            name: 'angular-flot',
                            files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                  'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                  'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                  'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/jquery.flot.time.js', 'assets/js/plugins/flot/angular-flot.js']
                        },
                        { name: 'fullCalendar', files: ['assets/js/plugins/fullcalendar/fullcalendar.min.css', 'assets/js/plugins/fullcalendar/fullcalendar.js', 'assets/js/plugins/fullcalendar/calendar.js']},
                        { name: 'calfguide', files: ['app/curves/curves.controller.js']},
                        { name: 'calfguide', files: ['app/curves/curves.services.js']},
                    ]).then(function() {
                        var CurvesServices = $injector.get("CurvesServices");

                        return CurvesServices.feedings($stateParams.taxi_id, '', '', 0, true,true,true, true, true,true).then(function (result) {
                            if (result[0].status != 500) {
                                return $q.when(result[0].data);
                            }

                            return $q.reject();
                        });
                    });
                }]
            }
        })

  // Taxiconfig -Timer
        .state('taxi_config', {
            abstract:    true,
            url:         '/taxi_config',
            templateUrl: 'views/taxi_config/wrapper.html',
            data: { pageTitle: 'config'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$q', function($ocLazyLoad, $injector, $q) {
                    return $ocLazyLoad.load([
                        {name: 'calfguide', files: ['app/taxi_config/taxiconfig.services.js']}
                    ])
                }]
            }
        })
            .state('taxi_config.timer', {
                url:          '/timer/:taxi_id',
                templateUrl:  'views/taxi_config/timer.html',
                controller:   'TaxiTimerController',
                controllerAs: 'vmTaxiTimer',
                data: { pageTitle: 'Timer' },
                resolve: {
                    loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$stateParams', '$timeout', '$q', '$state', function($ocLazyLoad, $rootScope, $injector, $stateParams, $timeout, $q, $state) {
                        return $ocLazyLoad.load([
                            {
                              serie: true,
                              name: 'angular-flot',
                              files: ['assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                      'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                      'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                      'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/jquery.flot.time.js', 'assets/js/plugins/flot/angular-flot.js']
                            },
                            {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                            { name: 'calfguide', files: ['app/taxi_config/timer.controller.js']},
                            { name: 'calfguide', files: ['app/taxi_config/timer.services.js']},

                        ]).then(function() {
                            var TaxiTimerServices = $injector.get("TaxiTimerServices");

                            return TaxiTimerServices.getTimer($stateParams.taxi_id).then(function (result) {
                                if (result.status != 500)  {
                                  var data = result.data.timer;
                                  var id = $rootScope.GlobalData.config.tempmessurement;
                                  var i = 0;
                                  for(i = 0; i <= data.length; i++){
                                    angular.forEach(data[i], function(value, key){
                                      if(key == "temp_c")
                                         data[i][key] = $rootScope.calcunits(13, id, value)
                                    });
                                  }
                                    return $q.when(data);
                                } else {
                                    $timeout(function () {
                                        $state.go('dashboard');
                                    })
                                }

                                return $q.reject();
                            });
                        });
                    }]
                }
            })
            .state('taxi_config.dosings', {
                url:          '/dosings/:taxi_id',
                templateUrl:  'views/taxi_config/dosings.html',
                controller:   'DosingsController',
                controllerAs: 'vmDosings',
                data: { pageTitle: 'Timer' },
                resolve: {
                    loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$stateParams', '$timeout', '$q', '$state', function($ocLazyLoad, $rootScope, $injector, $stateParams, $timeout, $q, $state) {
                        return $ocLazyLoad.load([
                            { name: 'calfguide', files: ['app/taxi_config/dosings.controller.js']},
                            { name: 'calfguide', files: ['app/taxi_config/dosings.services.js']}
                        ]).then(function() {

                            var DosingsServices = $injector.get("DosingsServices");
                            return DosingsServices.getDosings($stateParams.taxi_id).then(function (result) {

                            if (result.status != 500)  {
                              var data = result.data.dosings;
                              var id = $rootScope.GlobalData.config.volumemessurement;
                              var i = 0;
                              for(i = 0; i <= data.length; i++){
                                angular.forEach(data[i], function(value, key){
                                  if(key == "level")
                                     data[i][key] = $rootScope.calcunits(9, id, value)
                                });
                              }

                                return $q.when(data);
                            } else {
                                $timeout(function () {
                                $state.go('dashboard');
                                })
                            }
                            return $q.reject();

                            });
                        });
                    }]
                }
            })
            .state('taxi_config.curvestaxi', {
                url:          '/curvestaxi/:taxi_id',
                templateUrl:  'views/taxi_config/curvestaxi.html',
                controller:   'CurvesTaxiController',
                controllerAs: 'vmCurvesTaxi',
                data: { pageTitle: 'Timer' },
                resolve: {
                    loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$stateParams', '$timeout', '$q', '$state', function($ocLazyLoad, $rootScope, $injector, $stateParams, $timeout, $q, $state) {
                        return $ocLazyLoad.load([
                            {
                              serie: true,
                              name: 'angular-flot',
                              files: [ 'assets/js/plugins/flot/jquery.flot.js', 'assets/js/plugins/flot/jquery.flot.time.js',
                                      'assets/js/plugins/flot/jquery.flot.tooltip.min.js', 'assets/js/plugins/flot/jquery.flot.spline.js',
                                      'assets/js/plugins/flot/jquery.flot.resize.js', 'assets/js/plugins/flot/jquery.flot.pie.js',
                                      'assets/js/plugins/flot/curvedLines.js', 'assets/js/plugins/flot/jquery.flot.time.js', 'assets/js/plugins/flot/angular-flot.js']
                            },
                             {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                            { name: 'calfguide', files: ['app/taxi_config/curvesTaxi.controller.js']},
                            { name: 'calfguide', files: ['app/taxi_config/curvesTaxi.services.js']},
                        ]).then(function() {

                            var CurvesTaxiServices = $injector.get("CurvesTaxiServices");
                            return CurvesTaxiServices.getFeedingCurves($stateParams.taxi_id).then(function (result) {

                               if (result.status != 500)  {
                                 var data = result.data.curves;
                                 var id = $rootScope.GlobalData.config.volumemessurement;
                                 var i = 0;
                                 for(i = 0; i <= data.length; i++){
                                   angular.forEach(data[i], function(value, key){
                                     if(key == "a" || key == "b")
                                        data[i][key] = $rootScope.calcunits(9, id, value)
                                   });
                                 }
                                return $q.when(data);
                              } else {
                                $timeout(function () {
                                  $state.go('dashboard');
                                })
                              }
                              return $q.reject();

                            });
                        });
                    }]
                }
            })
        .state('mtxboxes', {
            url:          '/mtxboxes',
            templateUrl:  'views/mtxboxes/mtxboxes.html',
            controller:   'MtxBoxesController',
            controllerAs: 'vmMtxBoxes',
            data: { pageTitle: 'Boxes'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/mtxboxes/mtxboxes.services.js', 'app/mtxboxes/mtxboxes.controller.js' , 'app/single_taxi/single_taxi.services.js']}
                    ]).then(function() {
                        var MtxBoxesServices = $injector.get("MtxBoxesServices");
                        return MtxBoxesServices.getBoxes($stateParams.id).then(function (result) {
                            return result.data;
                        });
                    });
                }]
            }
        })
        .state('alarm', {
            url:          '/alarm',
            templateUrl:  'views/alarm/alarm.html',
            controller:   'AlarmController',
            controllerAs: 'vmAlarm',
            data: { pageTitle: 'Alarm'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', '$injector', '$stateParams', function($ocLazyLoad, $injector, $stateParams) {
                    return $ocLazyLoad.load([
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/alarm/alarm.services.js', 'app/alarm/alarm.controller.js']}
                    ])
                }]
            }
        })

    // Einstellungen
        .state('settings', {
            abstract:    true,
            url:         '/settings',
            templateUrl: 'views/settings/wrapper.html',
            data: { pageTitle: 'config'},
            resolve: {
                loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                        {name: 'calfguide', files: ['app/settings/settings.services.js']}
                    ]);
                }]
            }
        })
    //----  Einstellungen - Subframes
                .state('settings.base', {
                    url:          '/base',
                    templateUrl:  'views/settings/base.html',
                    controller:   'BaseSettingsController',
                    controllerAs: 'vmBaseSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/base.controller.js']}
                            ]);
                        }]
                    }
                })
                .state('settings.advanced', {
                    url:          '/advanced',
                    templateUrl:  'views/settings/advanced.html',
                    controller:   'AdvancedSettingsController',
                    controllerAs: 'vmAdvancedSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/advanced.controller.js']}
                            ]);
                        }]
                    }
                })
                .state('settings.feeder', {
                    url:          '/feeder',
                    templateUrl:  'views/settings/feeder.html',
                    controller:   'FeederSettingsController',
                    controllerAs: 'vmFeederSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/feeder.controller.js', 'app/settings/settings.services.js']}
                            ]).then(function() {
                                var SettingsServices = $injector.get("SettingsServices");
                                return SettingsServices.getFeederStatus().then(function (result) {
                                    return result.data;
                                });
                            });
                        }]
                    }
                })
                .state('settings.station', {
                    url:          '/station',
                    templateUrl:  'views/settings/station.html',
                    controller:   'StationSettingsController',
                    controllerAs: 'vmStationSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/station.controller.js', 'app/settings/settings.services.js']}
                            ]).then(function() {
                                var SettingsServices = $injector.get("SettingsServices");
                                return SettingsServices.getStationData().then(function (result) {
                                    return result.data;
                                });
                            });
                        }]
                    }
                })
                .state('settings.homelayout', {
                    url:          '/homelayout',
                    templateUrl:  'views/settings/homelayout.html',
                    controller:   'HomelayoutSettingsController',
                    controllerAs: 'vmHomelayoutSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/homelayout.controller.js', 'app/settings/settings.services.js']}
                            ]).then(function() {
                                var SettingsServices = $injector.get("SettingsServices");
                                return SettingsServices.getLayoutOptions().then(function (result) {
                                    return result.data;
                                });
                            });
                        }]
                    }
                })
                .state('settings.time', {
                    url:          '/date-time',
                    templateUrl:  'views/settings/date-time.html',
                    controller:   'TimeSettingsController',
                    controllerAs: 'vmTimeSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                            return $ocLazyLoad.load([
                                { files: ['assets/js/plugins/jasny/jasny-bootstrap.min.js']},
                                { name: 'calfguide', files: ['app/settings/time.controller.js']},
                                { name: 'datePicker', files: ['assets/css/plugins/datapicker/angular-datapicker.css','assets/js/plugins/datapicker/angular-datepicker.js']}
                            ]).then(function() {
                                var SettingsServices = $injector.get("SettingsServices");
                                return SettingsServices.getTimeData().then(function (result) {
                                    return result.data;
                                })
                            });
                        }]
                    }
                })
                .state('settings.event', {
                    url:          '/event',
                    templateUrl:  'views/settings/event.html',
                    controller:   'EventSettingsController',
                    controllerAs: 'vmEventSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$injector', function($ocLazyLoad, $injector) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/event.controller.js', 'app/settings/settings.services.js']},
                            ]).then(function() {
                                var SettingsServices = $injector.get("SettingsServices");
                                return SettingsServices.getEvents().then(function (result) {
                                    return result.data;
                                });
                            });
                        }]
                    }
                })
                .state('settings.update', {
                    url:          '/update',
                    templateUrl:  'views/settings/update.html',
                    controller:   'UpdateSettingsController',
                    controllerAs: 'vmUpdateSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$rootScope', '$state', function($ocLazyLoad, $rootScope, $state) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/update.controller.js']}
                            ]).then(function() {
                                if ($rootScope.session === undefined) {
                                    $state.go('bi.login');
                                }
                            });
                        }]
                    }
                })
                .state('settings.user', {
                    url:          '/user',
                    templateUrl:  'views/settings/user.html',
                    controller:   'UserSettingsController',
                    controllerAs: 'vmUserSettings',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$rootScope', '$state', '$injector', function($ocLazyLoad, $rootScope, $state, $injector) {
                            return $ocLazyLoad.load([
                                {name: 'calfguide', files: ['app/settings/user.controller.js', 'app/settings/settings.services.js']}
                            ]).then(function() {
                                if ($rootScope.session === '') {
                                    $state.go('bi.login');
                                } else {
                                    var SettingsServices = $injector.get("SettingsServices");
                                    return SettingsServices.getUserList().then(function (result) {
                                        return result.data;
                                    });
                                }
                            });
                        }]
                    }
                })
                .state('settings.taxilist', {
                    url:          '/taxilist/:taxi_id',
                    templateUrl:  'views/settings/taxilist.html',
                    controller:   'TaxiListController',
                    controllerAs: 'vmTaxiList',
                    resolve: {
                        loadPlugin: ['$ocLazyLoad', '$stateParams', '$injector', function($ocLazyLoad, $stateParams, $injector) {
                            return $ocLazyLoad.load([
                                {
                                    name: 'calfguide',
                                    files: ['app/settings/taxilist.controller.js', 'app/settings/taxilist.services.js']
                                }
                            ]).then(function() {

                                var TaxiListServices = $injector.get("TaxiListServices");

                                return TaxiListServices.getTaxiList().then(function (result) {
                                    return result.data;
                                });

                            });
                        }]
                    }
                })
                .state('settings.errors', {
                          url:          '/errors/:taxi_id',
                          templateUrl:  'views/settings/errors.html',
                          controller:   'ErrorsController',
                          controllerAs: 'vmErrors',
                          data: { pageTitle: 'Errors' },
                          resolve: {
                              loadPlugin: ['$ocLazyLoad', '$rootScope', '$injector', '$stateParams', '$timeout', '$q', '$state', function($ocLazyLoad, $rootScope, $injector, $stateParams, $timeout, $q, $state) {
                                  return $ocLazyLoad.load([
                                      { name: 'calfguide', files: ['app/settings/errors.controller.js']},
                                      { name: 'calfguide', files: ['app/settings/errors.services.js']}
                                  ]).then(function() {

                                      var ErrorsServices = $injector.get("ErrorsServices");
                                      return ErrorsServices.getErrors($stateParams.taxi_id).then(function (result) {

                                      if (result.status != 500)  {
                                          return $q.when(result.data.errors);
                                      } else {
                                          $timeout(function () {
                                          $state.go('dashboard');
                                          })
                                      }
                                      return $q.reject();

                                    });
                                  });
                              }]
                          }
                      })
                .state('settings.modal', {
                    url: 'modal/',
                    templateUrl: 'views/settings/modal.html',
                })
    //----  Ende Einstellungen - Subframes
        .state('export', {
            url:          '/exporter',
            controller:   'ExportController',
            controllerAs: 'vmExport',
            templateUrl:  'views/export/export.html',
            resolve: {
                loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        { name: 'calfguide', files: ['app/export/export.controller.js', 'app/export/export.services.js']},
                        { name: 'datePicker', files: ['assets/css/plugins/datapicker/angular-datapicker.css','assets/js/plugins/datapicker/angular-datepicker.js']},
                        {files: ['assets/css/plugins/iCheck/custom.css','assets/js/plugins/iCheck/icheck.min.js']},
                    ]);
                }]
            }
        })
}


angular
    .module('calfguide')
    .config(config)
    .run(function($rootScope, $state, $http, toaster, $timeout) {
        $rootScope.session = "doof";
        $rootScope.biConflict = false;
        $rootScope.$state = $state;
        // Config und Labels laden
        $.ajax('ajax/base/GLOBALDATA.php', {async: false}).success(function (result) {
            result = angular.fromJson(result);
            $rootScope.GlobalData = {};
            $rootScope.GlobalData.feeder    = result.feeder;
            $rootScope.GlobalData.config    = result.config;
            $rootScope.GlobalData.labels    = result.labels;
            $rootScope.GlobalData.einheiten = result.einheiten;
            $rootScope.GlobalData.calc      = result.calc;
            $rootScope.GlobalData.nachkomma = result.nachkomma;
            $rootScope.GlobalData.taxis     = result.taxis;
            $rootScope.GlobalData.calcunits = result.calcunits;
        }).error(function (reason) {
            console.log("KEINE CONFIG");
        });


        // Labelfunktion definieren
        $rootScope.getLabel = function(labelname) {
            return (jQuery.isEmptyObject($rootScope.GlobalData.labels[labelname]) ? labelname +" (n.t.)" : $rootScope.GlobalData.labels[labelname]);
        };

        // Einheiten laden
        $rootScope.getEinheiten = function(labelid) {
            return (jQuery.isEmptyObject($rootScope.GlobalData.einheiten[labelid]) ? labelid +" (n.t.)" : $rootScope.GlobalData.einheiten[labelid]);
        };


        // Unit Calculater
        $rootScope.calcunits = function(unit_id_from, unit_id_to, value){
          var calcvalue = [];
          var parsed = angular.fromJson($rootScope.GlobalData.calc);
          angular.forEach(parsed, function(value, key){
            calcvalue[key] = value;
          });
            var base_id = [1, 9, 13, 15];
            var result;
            if(unit_id_from != unit_id_to) {
              if(base_id.indexOf(unit_id_from) > 0){
                if(unit_id_to == 11)
                  result = Math.floor(value * 1.8 + 32);
                else {
                    var val = calcvalue[unit_id_to];
                    result =  (value / val).toFixed(1);
                  //var val = angular.fromJson(getCalcValue(unit_id_to));
                  //result =  (value / val[0].calc).toFixed(1);
                }
              }
              else{
                if(unit_id_from == 11)
                  result = Math.floor((value - 32) / 1.8);
                else {
                    var val = calcvalue[unit_id_from];
                    result =  (value * val).toFixed(1);
                  //var val = angular.fromJson(getCalcValue(unit_id_from));
                  //result =  (value * val[0].calc).toFixed(1);
                }
              }
            }
            else result = value;
            return result;
        };


        // Calc der Einheit
        $rootScope.getCalc = function(labelid) {
            return (jQuery.isEmptyObject($rootScope.GlobalData.calc[labelid]) ? labelid +" (n.t.)" : $rootScope.GlobalData.calc[labelid]);
        };

        $rootScope.getNachkomma = function(labelid) {
            return (jQuery.isEmptyObject($rootScope.GlobalData.nachkomma[labelid]) ? labelid +" (n.t.)" : $rootScope.GlobalData.nachkomma[labelid]);
        };

        // Ruft den Status der Automaten ab (Top Navigation)
        $rootScope.updateFeederStatus = function() {
            $http.get('ajax/settings/get_feederStatus.php?asArray=false').then(function (result) {
                $rootScope.GlobalData.status = result.data.feederStatus;
            })
        }

        $rootScope.checkBiConflict = function() {
            $http.get('ajax/bi/checkConflict.php').then(function (result) {
                $rootScope.biConflict = result.data.hasConflicts;
            })
        }

        // Gibt das Datumsformat je nach Einstellung zurück
        $rootScope.getDateFormat = function() {
            switch ($rootScope.GlobalData.config.dateformat) {
                case 'd.m.y' :
                    return 'DD.MM.YYYY';
                    break;
                default:
                    return 'MM/DD/YYYY';
                    break;
            }
        }


        $rootScope.$on('$stateChangeStart', function (event, next) {
            // Automatenstatus in der TopNavigation aktualisieren
            $rootScope.updateFeederStatus();
            $rootScope.checkBiConflict();
            if($rootScope.GlobalData.config.mtx_enabled == 1 && $rootScope.GlobalData.config.hl100_enabled == 0) {
              if(next.url == '/dashboard')
              {
                $timeout(function() {
                  $state.go('single_taxi', {'taxi_id': $rootScope.GlobalData.taxis[0].taxi_id}, { reload: true });
                });
              }
            }
        })
    });
