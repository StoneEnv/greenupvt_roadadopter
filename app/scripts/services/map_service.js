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
 | Authors: Nick Floersch - nick@stone-env.com
 |          Alan Hammersmith - ahammersmith@stone-env.com
 | File: map_service.js
 | Description: An Angular service to provide state control and
 |              additional functionality for seMap* directives.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define([
    'angularMapApp/services/map_service'
], function (map_service) {
    var module = angular.module('mapService', []);
    
    module.factory('MapSvc', ['$rootScope', '$http', '$q',
        function ($rootScope, $http, $q) {
            var knownMaps = [];
            var urlConfig = "";
            var URLROOT = "";
            var _moduleScopes = {};

            function maybeApply() {
                if ($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest') {
                    $rootScope.$apply();
                }
            }

            function _loadConfig() {
                // Store config as JSON in external location.
                // Load it here with $http service.
                var deferred = $q.defer();
                $http.get("./scripts/services/urlConfig.json")
                    .success(function(data, status, headers, config) {
                        deferred.resolve(data);
                        }
                    )
                    .error(function(errmsg, status){
                        deferred.reject(errmsg);
                        }
                    );
                return deferred.promise;
            }

            function _setConfig() {
                var urlConfigPromise = _loadConfig();
                urlConfigPromise.then(
                    function(resp) {
                        urlConfig = resp;
                        URLROOT = urlConfig["webServiceRootURL"];
                    },
                    function(error) {
                        URLROOT = "https://geodata104-www.stone-env.com/arcgis/rest/";
                    }
                );
            }
            _setConfig();

            function _setMap(mapId,mapObj) {
                knownMaps[mapId] = mapObj;
            }

            function _getMap(mapId) {
                return knownMaps[mapId];
            }
            
            return {
                setMap: function(mapId, mapObj) {
                    return _setMap(mapId, mapObj);
                },
                getMap: function(mapId) {
                    return _getMap(mapId);
                },
                setScope: function(name,scopeObj) {
                    _moduleScopes[name] = scopeObj;
                    return;
                },
                getScope: function(name) {
                    return _moduleScopes[name];
                }
                
            }; // END return
        } // END function
    ]); // END factory
    
    return module;
});
