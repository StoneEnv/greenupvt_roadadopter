/* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= 
 | All Code Copyright 2014 Stone Environmental, Inc.
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
 | Author: Nick Floersch - nick@stone-env.com
 | File: util_service.js
 | Description: An Angular service for misc. utilities
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define([
    ], function () {
    var module = angular.module('utilService', []);

    module.factory('UtilSvc', ['$rootScope',
        function ($rootScope) {
            //-----------------------------------------------------------------
            function _maybeApply() {
                if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
                    $rootScope.$apply();
                    }
            }
            //-----------------------------------------------------------------
            
            
            //-----------------------------------------------------------------
            //#################################################################
            //-----------------------------------------------------------------
            return {
                hasOwnProperty: function(obj,prop) {
                    if ((obj == undefined) || (obj == null)) return false;
                    var proto = obj.__proto__ || obj.constructor.prototype;
                    return (prop in obj) && (!(prop in proto) || proto[prop] !== obj[prop]);
                },
                clearSelected: function(collection) {
                    if (collection) {
                        for(var i = 0; i < collection.length; i++) {
                            collection[i].isSelected = false;
                        }
                    }
                },
                maybeApply: function() {
                    _maybeApply();
                },
                // Capitalize first letter of string passed in.
                capitalize: function(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
            }
        }
    ]);


    return module;
});