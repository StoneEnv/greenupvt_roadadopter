/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
 | All Code Copyright 2016 Stone Environmental, Inc.
 | This program is free software: you can redistribute it and/or modify
 | it under the terms of the GNU Affero General Public License as published
 | by the Free Software Foundation, either version 3 of the License, or
 | (at your option) any later version.
 |
 | This program is distributed in the hope that it will be useful,
 | but WITHOUT ANY WARRANTY; without even the implied warranty of
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 | GNU Affero General Public License for more details.
 |
 | You should have received a copy of the GNU Affero General Public License
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.
 |
 | Author: Copied from Angular website example code
 | File: seRegexFilter.js
 | Description: Directives to filter element content by regex
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define(
    [], 
    function () {
        var module = angular.module('regexFilters', []);
        // Directive to display first match group of regex'ed content
        // For example return nick from nick@stone-env.com with an
        // attribute value for 'ng-regex' of
        // ^([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$
        // 
        // <patternFilterFront ng-model="model" ng-regex="^([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"></patternFilterFront>
        module.directive(
            'patternFilterFront', 
            function($interpolate) {
                return {
                    require: '?ngModel',
                    restrict: 'E',
                    template:'<span class="patternValue"><span></span></span>',
                    replace:true,
                    link: function(scope, element, attrs, ngModel) {
                        ngModel.$render = function(){
                            var regex = attrs.ngRegex;
                            var tmp =  $interpolate('{{' + attrs.ngModel + '}}')(scope);
                            var res = tmp.match(regex);
                            element.find('span').html(res[1]);
                        }
                    }
                };
            }
        );
    }
);