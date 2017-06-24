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
 | File: ngConvertToNumber.js
 | Description: a data formatter for Angular input elements
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define(
    [], 
    function () {
        var module = angular.module('nonStringSelect', []);
        module.directive(
            'convertToNumber', 
            function() {
                return {
                    require: 'ngModel',
                    link: function(scope, element, attrs, ngModel) {
                        ngModel.$parsers.push(function(val) {
                            return parseInt(val, 10);
                        });
                        ngModel.$formatters.push(function(val) {
                            return '' + val;
                        });
                    }
                };
            }
        );
    }
);