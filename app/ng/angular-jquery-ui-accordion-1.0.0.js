angular.module('angularJqueryUiAccordion', [])
.directive('accordion', ['$window', '$q', '$templateCache', '$timeout', '$compile', '$http', function($window, $q, $templateCache, $timeout, $compile, $http) {
    (function($, sr){
        // debounce the resize to use less cpu
        var debounce = function (func, threshold, execAsap) {
            var timeout;

            return function() {
                var obj = this, args = arguments;
                function delayed () {
                    if (!execAsap) {
                        func.apply(obj, args);
                    }
                    timeout = null;
                };

                if (timeout) {
                    clearTimeout(timeout);
                }

                timeout = setTimeout(delayed, threshold);
            };
        }

        // smartresize
        jQuery.fn[sr] = function(fn, threshold){  return fn ? this.bind('resize', debounce(fn, threshold)) : this.trigger(sr); };
    })(jQuery,'smartresize');

    return {
        restrict: 'A',
        scope: false,
        transclude: false,
        replace: false,
        link: function(scope, Elem, Attr) {
            var element = Elem;
            var attributes = Attr;
            //_log(element);
            element.accordion({
                heightStyle: 'fill',
                header: "> div > h3"
            });
            element.on('ngRefresh', function (event) {
                var $this = $(this);
                $timeout(function () {
                    //_log($this.attr('active-tab') || 0);
                    scope.$apply(function() {
                        $this.accordion('destroy').accordion({
                            heightStyle: 'fill',
                            header: "> div > h3",
                            active: Number($this.attr('active-tab'))
                        });
                    });
                    $this.accordion( "option", "active", Number($this.attr('active-tab')) );
                },200)

            });
            angular.element($window).smartresize(function() {
                //_log('refreshed!!')
                if(element.is(':hidden')) return;
                scope.$apply(function() {
                    element.accordion('destroy').accordion({
                        heightStyle: 'fill',
                        header: "> div > h3",
                        active: attributes.activeTab || 0
                    });
                });

                if (typeof attributes.activeTab !== 'undefined') {
                    element.accordion( "option", "active", Number(attributes.activeTab) );
                }
            }, attributes.refreshDebounceThreshold || 100);
        }
    };
}]);
