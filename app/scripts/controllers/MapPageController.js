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
 | File: MapPageController.js
 | Description: Controller for Map Page
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';

define([

    ], function () {

    var module = angular.module('MapPageController', []);

    module.controller('MapPageController', ['$scope', 'MapSvc', '$q','$http',
        function ($scope, MapSvc, $q, $http) {

            function getServiceJSON(url) {
                var deferred = $q.defer();
                $http.post(url)
                    .success(
                        function (data, status, headers, config) {
                            deferred.resolve(data);
                        }
                    )
                    .error(
                        function (msg, code) {
                            deferred.reject(msg);
                        }
                    );
                return deferred.promise;
            }

            function getDomains(url) {
                var deferred = $q.defer();

                var svcPromise = getServiceJSON(url);
                svcPromise.then(
                    function(data) {
                        var fields = data.fields;
                        var domainFields = {};
                        for (var i = 0; i < fields.length; i++) {
                            if (fields[i]['domain']) {
                                if (fields[i].domain.type == 'codedValue') {
                                    domainFields[fields[i].name] = fields[i].domain;
                                }
                            }
                        }
                        deferred.resolve(domainFields);
                    },
                    function(err) {
                        console.log("getDomainsError: " + err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }

            function getAliases(url) {
                var deferred = $q.defer();

                var svcPromise = getServiceJSON(url);
                svcPromise.then(
                    function(data) {
                        var fields = data.fields;
                        var aliases = {};
                        for (var i = 0; i < fields.length; i++) {
                            if (fields[i]['alias']) {
                                aliases[fields[i]['name']] = fields[i]['alias'];
                            }
                        }
                        deferred.resolve(aliases);
                    },
                    function(err) {
                        console.log("getAliasesError: " + err);
                        deferred.reject(err);
                    });
                return deferred.promise;
            }

            $scope.mapConfig = {
                initCenter: ['-73.00179321284716', '44.39643513559109'],
                initZoom: 13,
                basemaps: [
                    'Streets'
                ],
                layers: [ // lyrs on top get put on bottom of TOC
                    {
                        id: 'lyrBasemap', 
                        label: 'Richmond Basemap', 
                        type: 'tile',
                        opacity: 0.7, 
                        visible: true,
                        url: 'https://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/Richmond_VT_Base_v1/MapServer'
                    },
                    {
                        id: 'lyrAdoptedRoadsBlue',
                        label: 'Adopted Roads Feature Layer wComments',
                        visible: true,
                        type: 'feat',
                        isEditable: false,
                        isSelectable: false,
                        listenForRefresh: true,
                        url: 'https://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/adopted_roads/MapServer/2'
                    },
                    {
                        id: 'lyrAdoptedRoads',
                        label: 'Adopted Roads Feature Layer',
                        visible: true,
                        type: 'feat',
                        isEditable: false,
                        isSelectable: false,
                        listenForRefresh: true,
                        url: 'https://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/adopted_roads/MapServer/1'
                    },
                    {
                        id: 'lyrRoads',
                        label: 'Roads Feature Layer',
                        visible: true,
                        type: 'feat',
                        isEditable: true,
                        isSelectable: true,
                        relatedFields: ['userid','greenuptime','comments','messlevel','readyforpickup','bags'],
                        relatedFieldTypes: {
                            'numvote' : 'number',
                            'comments' : 'textarea',
                            'messlevel' : 'number:domain',
                            'readyforpickup' : 'checkbox',
                            'userid' : 'text',
                            'greenuptime' : 'text:domain',
                            'bags':'number'
                        },
                        relatedFieldAliases: getAliases('http://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/adopted_roads/FeatureServer/3/numvote?f=pjson'),
                        relatedFieldDomains: getDomains('http://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/adopted_roads/FeatureServer/3/numvote?f=pjson'),
                        relatedFieldId: 'recordid',
                        featureFriendlyName: 'primaryname',
                        relatedSecret: 'userid:E-mail:^([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$',
                        label_buttonAdd: 'Adopt!',
                        label_secretDescriptor: 'An',
                        url: 'https://geodata104-www.stone-env.net/arcgis/rest/services/greenup_richmond/adopted_roads/FeatureServer/0'
                    }

                ],
                mapGraphics: []
            };
        }
    ]);
    return module;
});