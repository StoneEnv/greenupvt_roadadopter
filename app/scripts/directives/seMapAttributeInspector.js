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
 | File: seMapAttributeInspector.js
 | Description: A wrapper around the Attribute Inspector dijit
 |              for the seMap directive.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define(
    [
        "esri/dijit/AttributeInspector",
    ], 
    function (
        AttributeInspector
    ) {
        var module = angular.module('seMapAttributeInspector', ["ui.router"]);
        module.directive(
            'seMapAttributeInspector', 
            [
                '$rootScope',
                'MapSvc',
                function($rootScope, MapSvc) {
                    return {
                        restrict: 'E',
                        replace: false,
                        transclude: false,
                        scope: {
                            mapId: '@',
                            layerId: '@'
                        },
                        templateUrl: './views/directives/seMapAttributeInspector.html',
                        link: function($scope,elem,attributes) {
                            console.log('Starting Directive [Attribute Inspector]');
                            //========== INIT =====================================================
                            $scope.mapController = MapSvc.getMap(attributes.mapId);
							elem.append('<div id="' + 'attInsp_' + $scope.mapId + '_' + $scope.layerId + '" class="map"></div>');
                            var attrInspElem = angular.element( document.querySelector( '#attInsp_' + $scope.mapId + '_' + $scope.layerId));
                            attrInspElem.append('<div id="' + 'attInsp_' + $scope.mapId + '_' + $scope.layerId + '_newRRBtn" class="map"></div>');
                            var layerInfos = [
                                {
                                    'featureLayer': $scope.mapController.getLayer($scope.layerId),
                                    'showAttachments': true,
                                    'isEditable': false,
                                    'fieldInfos': [
                                        {
                                            'fieldName': 'relationships/0/numvote',
                                            'label': 'Votes',
                                            'isEditable': true
                                        },
                                        {
                                            'fieldName': 'relationships/0/comments',
                                            'label': 'Comments'
                                        },
                                        {
                                            'fieldName': 'relationships/0/messlevel',
                                            'label': 'Rough Estimate of Messiness'
                                        },
                                        {
                                            'fieldName': 'relationships/0/readyforpickup',
                                            'label': 'Ready For Town Truck To Pickup Bags?'
                                        },
                                        {
                                            'fieldName': 'relationships/0/userid',
                                            'label': 'Name of Adopter of Road'
                                        },
                                        {
                                            'fieldName': 'primaryname',
                                            'label' : 'Road Name',
                                            'isEditable': true
                                        }//,
                                        // {
                                        //     'fieldName': 'relationships/0/greenuptime',
                                        //     'label': 'When Will This Adopter Greenup The Road?'
                                        // }
                                    ]
                                }
                            ]
                            var attInsp = new AttributeInspector({
                                layerInfos: layerInfos
                            }, "attInsp_" + $scope.mapId + "_" + $scope.layerId);
                            attInsp.startup();
                            //========= WATCHES ===================================================
                            $rootScope.$on("featureSelectClick", function(event,data) {
                                alert("caught feature select click");
                                //attInsp.refresh();
                            });
                            //========= ACTIONS ===================================================
                        }
                    };
                }
            ]
        );
    }
);