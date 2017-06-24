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
 | File: seModal.js
 | Description: A modal message display directive.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define([
    ], function () {

    var module = angular.module('seModal', ["ui.router"]);
    module.directive('seModal', ['$rootScope','$compile','FormSvc','UtilSvc',
        function($rootScope, $compile, FormSvc, UtilSvc) {
            return {
                restrict: 'E',
                // replace: false,
                transclude: true,
                scope: {
                    // message:'=message',
                    // title:'=title',
                    //seVisible:'@'
                },
                templateUrl: './views/directives/seModal.html',
                link: function($scope,elem,attributes) {
                    console.log('Starting Directive [Modal]');
                    //========== INIT =====================================================
                    // if (attributes.hasOwnProperty("ngShow")) {
                    //     function ngShow() {
                    //         if ($scope.ngShow === true) {
                    //             $element.show();
                    //         }
                    //         else if($scope.ngShow === false) {
                    //             $element.hide();
                    //         }
                    //     }
                    //     $scope.$watch("ngShow", ngShow);
                    //     setTimeout(ngShow, 0);
                    // }
                    
                    $scope['seVisible'] = false;

                    function setVisibility(value) {
                        $scope['seVisible'] = value;
                    }

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
                    $rootScope.$on('setVisibility',function(evt,value) {
                       setVisibility(value); 
                    });

                    $scope.isVisible = function() {
                        console.log("[seModal] isVisbile? --> " + $scope.seVisible);
                        return $scope.seVisible;
                    }
                    //
                    $rootScope.$on('showSecret', function(evt,data) {
                        console.log("[seModal] caught emit of 'showSecret'");
                        $rootScope.$broadcast('setVisibility',true);
                        //var newElem = elem.append('<div id="' + nodeId + '" class="secretForm"></div>');
                        
                        var nodeId = data.nodeId;
                        var oid = data.oid;
                        var gid = data.gid;

                        if (!(oid || gid)) return;

                        var id = (gid ? gid : oid);
                        var mode = data.mode;

                        $scope.shtml = '';
                        $scope.shtml = angular.element(FormSvc.renderSecretToHTML(nodeId,id,mode,$scope.close));
                        $scope.addRecord = null;
                        $compile($scope.shtml)($scope, function(cloned, $scope){
                            angular.element( document.querySelector( '#content' ) ).empty();
                            angular.element( document.querySelector( '#content' ) ).append(cloned);
                        });
                        // Forces updates to view despite ArcGIS Dojo stuff not
                        // knowing such stuff exists.
                        UtilSvc.maybeApply();
                    });

                    $scope.close = function(value,id,mode) {
                        $rootScope.$broadcast('setVisibility',false);
                        switch(mode) {
                            case 'add':
                                $rootScope.$broadcast("relrec_secretAdd",{value: value, gid: id});
                                break;
                            case 'update':
                                $rootScope.$broadcast("relrec_secretUpdate",{value: value, oid: id});
                                break;
                            case 'delete':
                                $rootScope.$broadcast("relrec_secretDelete",{value: value, oid: id});
                                break;
                            default:
                                $rootScope.$broadcast("relrec_cancelSecret",{});
                                $scope.addRecord = null;
                                $scope.shtml = '';
                                angular.element( document.querySelector( '#content' ) ).empty();
                                break;
                        }
                        UtilSvc.maybeApply();
                    };
                }
            };
        }
    ]);
});
