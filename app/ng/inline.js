/**
 * ngInline
 * an AngularJs directive for inline editing
 * By: Andrew Mead
 **/

angular.module('inline', []).directive('inline', function ($sce) {
    return {
        template: '<span ng-switch on="edit" >' +
        '<span ng-switch-default>{{value}}</span><div ng-switch-when="true" ng-model="$parent.value" class="selecteable" contentEditable="true" ng-bind-html="html" ></div></span>',
        restrict: 'A',
        scope: {
            inline: '='
        },
        link: function (scope, element, attribs) {
            scope.value = scope.inline;

            /* watch for changes from the controller */
            scope.$watch('inline', function (val) {
                scope.value = val;
            });

            function placeCaretAtEnd(el) {
                el.focus();
                if (typeof window.getSelection != "undefined"
                    && typeof document.createRange != "undefined") {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else if (typeof document.body.createTextRange != "undefined") {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(el);
                    textRange.collapse(false);
                    textRange.select();
                }
            }

            /* enable inline editing functionality */
            var enablingEditing = function () {
                scope.edit = true;
                scope.html = $sce.trustAsHtml(scope.inline);
                setTimeout(function () {
                    element.children().children('div')[0].focus();
                    placeCaretAtEnd(element.children().children('div')[0]);
                    element.children().children('div').bind('blur', function (e) {
                        scope.$apply(function () {
                            disablingEditing();
                        });
                    });
                }, 100);
            };


            /* disable inline editing functionality */
            var disablingEditing = function () {
                scope.edit = false;
                scope.inline = scope.value;
            };


            /* set up the default */
            disablingEditing();


            /* when the element with the inline attribute is clicked, enable editing */
            element.bind('dblclick', function (e) {

                if ((e.target.nodeName.toLowerCase() === 'span')) {
                    scope.$apply(function () { // bind to scope
                        enablingEditing();
                    });
                }
            });

            /* allow editing to be disabled by pressing the enter key */
            element.bind('keypress', function (e) {

                if (e.target.nodeName.toLowerCase() != 'div') return;

                var keyCode = (window.event) ? e.keyCode : e.which;

                if (keyCode === 13) {
                    scope.$apply(function () { // bind scope
                        disablingEditing();
                    });
                }
            });
        }
    }
});