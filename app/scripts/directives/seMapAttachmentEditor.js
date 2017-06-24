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
 | File: seMapAttachmentEditor.js
 | Description: A wrapper around the ESRI Attachment Editor
 |              dijit to be used with the seMap directive.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define(
    [
        "esri/dijit/editing/AttachmentEditor",
    ], 
    function (
        AttachmentEditor
    ) {
        var module = angular.module('seMapAttachmentEditor', ["ui.router"]);
        module.directive(
            'seMapAttachmentEditor', 
            [
                '$rootScope',
                'MapSvc',
                'UtilSvc',
                function($rootScope, MapSvc, UtilSvc) {
                    return {
                        restrict: 'E',
                        replace: false,
                        transclude: false,
                        scope: {
                            mapId: '@',
                            layerId: '@'
                        },
                        templateUrl: './views/directives/seMapAttachmentEditor.html',
                        link: function($scope,elem,attributes) {
                            console.log('Starting Directive [Attachment Editor]');
                            //========== INIT =====================================================
                            MapSvc.setScope('attachmentEditor',$scope);
                            $scope.mapController = MapSvc.getMap(attributes.mapId);

                            var nodeId = "attachEdit_" + $scope.mapId + "_" + $scope.layerId;
                            var featureLayer = $scope.mapController.getLayer($scope.layerId);

							elem.append('<div id="' + nodeId + '" class="map"></div>');

                            var attachmentEditor = new AttachmentEditor({}, nodeId);
                            attachmentEditor.startup();
                            //========= WATCHES ===================================================
                            $scope.$on("featureSelectClick", function(event,data) {
                                console.log("Attachment Editor: caught feature select click");
                                attachmentEditor.showAttachments(data.graphic,featureLayer);
                            });
                            $scope.$on("featureSelectClear", function(event,data) {
                                console.log("Attachment Editor: caught feature select clear");
                                attachmentEditor.showAttachments({},featureLayer);
                            });
                            //========= ACTIONS ===================================================
                        }
                    };
                }
            ]
        );
    }
);