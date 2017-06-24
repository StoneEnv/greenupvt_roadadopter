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
 | Author: Nick Floersch - nick@stone-env.com
 | File: seFooter.js
 | Description: A page footer directive.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define([
    ], function () {

    var module = angular.module('seFooter', ["ui.router"]);
    module.directive('seFooter', ['$rootScope',
        function($rootScope) {
            return {
                restrict: 'E',
                replace: false,
                transclude: false,
                scope: {},
                templateUrl: './views/directives/seFooter.html',
                link: function($scope,elem,attributes) {
                    console.log('Starting Directive [Footer]');
                    //========== INIT =====================================================
                    
                    //========= WATCHES ===================================================
                    // Keep an eye on the user service's current user setting to Keep
                    // the GUI up to date with the user's info (mostly name).
                    ///////////////////////////////////////////////////////////////////////
                    // $scope.$watch(
                    //     function(scope) {
                    //         var tState = $state.current.name;
                    //         //console.log("watching $state.current.name: " + tState);
                    //         return tState;
                    //     },
                    //     function(newValue, oldValue) {
                    //         if (newValue == oldValue) {
                    //             return;
                    //         }
                    //         else {
                    //             $scope['page'] = newValue;
                    //         }
                    //     }
                    // );
                    //========= ACTIONS ===================================================
                    // $scope['doClick'] = function(uname, upass) {

                    // };
                    $scope.showDataSources = function() {
                        $rootScope.$broadcast('showDataSources',true);
                    }
                }
            };
        }
    ]);
});
