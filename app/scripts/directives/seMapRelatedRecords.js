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
 | File: seMapRelatedRecords.js
 | Description: A related-records editor directive tied to
 |              the seMap directive.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define(
    [
        'esri/tasks/RelationshipQuery',
        'esri/layers/FeatureLayer',
    ], 
    function (
        RelationshipQuery,
        FeatureLayer
    ) {
        var module = angular.module('seMapRelatedRecords', ["ui.router"]);
        module.directive(
            'seMapRelatedRecords', 
            [
                '$rootScope','$compile','MapSvc','UtilSvc','FormSvc','$q','$http',
                function($rootScope, $compile, MapSvc, UtilSvc, FormSvc,$q,$http) {
                    return {
                        restrict: 'E',
                        replace: false,
                        scope: {
                            mapId: '@', // the id of the map object stored in the map service
                            layerId: '@', // the id of the feature layer to look for related records in
                            relatedTableName: '@' // the name of the table related to that feature layer
                        },
                        templateUrl: './views/directives/seMapRelatedRecords.html',
                        link: function(scope,elem,attributes) {
                            console.log('Starting Directive [Related Records Tool]');
                            //========== INIT =====================================================
                            MapSvc.setScope('relatedRecords',scope);
                            scope.mapController = MapSvc.getMap(attributes.mapId);

                            function getTableId(name,url) {
                                // Gets the JSON version of the given REST endpoint (at url)
                                // and iterates through table list looking for id of table
                                // whose name matches the input name param. Returns just
                                // that id (0, 1, 2 etc.).
                                var deferred = $q.defer();
                                $http.post(url + "?f=json")
                                .success(
                                    function (data, status, headers, config) {
                                        var layerJSON = data;
                                        var tableList = layerJSON.tables;
                                        for (var i = 0; i < tableList.length; i++) {
                                            if (tableList[i].name == name) deferred.resolve(tableList[i].id);
                                        }
                                        deferred.reject("table name " + name + " not found");
                                    }
                                )
                                .error(
                                    function (msg, code) {
                                        deferred.reject(msg);
                                    }
                                );
                                return deferred.promise;
                            }

                            function getRelatedTable(name,layer) {
                                // The base URL is the URL of the FeatureServer without any
                                // layer IDs in the URL (no /0 or /1 at end).
                                var baseUrl = featureLayer.baseUrl;
                                // To find the ID we want, we'll need to traverse the JSON
                                // representation of the FeatureServer's REST endpoint...
                                var getTableIdPromise = getTableId(name,baseUrl);
                                getTableIdPromise.then(
                                    function(data) {
                                        // Construct the full URL to the REST endpoint for the
                                        // specific "table layer" of the FeatureServer
                                        var tableUrl = baseUrl + '/' + data;
                                        // Instantiate a new FeatureLayer at that URL.
                                        // Note this is not a full FeatureLayer in that it has no
                                        // geometery capability inherently.
                                        var table = new FeatureLayer(tableUrl);
                                        // Store this table FeatureLayer locally so we can call
                                        // applyEdits and add etc. on it to edit the related
                                        // records.
                                        scope.relatedTable = table;
                                    },
                                    function(err) {
                                        console.log("Error in getRelatedTable: " + JSON.stringify(err, null, 2));
                                        scope.relatedTable = '';
                                    });
                            }

                            var nodeId = "relRec_" + scope.mapId + "_" + scope.layerId;
                            var featureLayer = scope.mapController.getLayer(scope.layerId);

                            function resetAddRecord() {
                                scope.addRecord = {attributes:{}};
                                for (var fieldName in featureLayer.relatedFields) {
                                    scope.addRecord['attributes'][featureLayer.relatedFields[fieldName]] = null;
                                }
                            }
                            // To edit/add related records, we actually need a separate featureLayer
                            // object tied to the URL of the _related table_ we are editing. Since
                            // the table name must be resolved to a layer ID in the feature service,
                            // we can't hard-code the layer ID - if the feature service adds a layer,
                            // the table's layer ID could change. Instead we will query the feature
                            // service, get the list of tables, and search through them for the table
                            // with the name matching the one passed in to the directive's
                            // related-table-name attribute.
                            getRelatedTable(scope.relatedTableName, featureLayer);
							elem.append('<div id="' + nodeId + '" class="map"></div>');

                            //========= WATCHES ===================================================
                            scope.$on("featureSelectClick", function(event,data) {
                                console.log("Related Records: caught feature select click");
                                getRelatedRecords(data.graphic);                               
                            });


                            scope.$on("featureSelectClear", function(event,data) {
                                console.log("Related Records: caught feature select clear!");
                                clearRelatedRecords();
                            });

                            $rootScope.$on('relrec_secretAdd', function(evt,data) {
                                console.log("[Related Records] caught 'relrec_secretAdd'!");
                                if (!(scope.verifySecretFormat(data.value))) scope.addRelated(data.gid);
                                else {
                                    var relatedSecret = (featureLayer.relatedSecret ? featureLayer.relatedSecret : '');
                                    scope.addRecord.attributes[relatedSecret.split(':')[0]] = data.value.toLowerCase();
                                    scope.addRelatedFinalize(data.gid);
                                }
                            });

                            $rootScope.$on('relrec_secretUpdate', function(evt,data) {
                                console.log("[Related Records] caught 'relrec_secretUpdate'!");
                                if (!(scope.verifySecretValue(data.value,data.oid))) scope.updateRelated(data.oid);
                                else {
                                    scope.updateRelatedFinalize(data.oid);
                                }
                            });

                            $rootScope.$on('relrec_secretDelete', function(evt,data) {
                                console.log("[Related Records] caught 'relrec_secretDelete'!");
                                if (!(scope.verifySecretValue(data.value,data.oid))) scope.deleteRelated(data.oid);
                                else {
                                    scope.deleteRelatedFinalize(data.oid);
                                }
                            });

                            $rootScope.$on('relrec_cancelSecret', function(evt,data) {
                                console.log("[Related Records] caught 'relrec_cancelSecret!");
                                resetAddRecord();
                            });

                            //========= ACTIONS ===================================================
                            function populateForm(fconfig) {
                                // The Form Service is tasked with creating templates
                                // for the given relate records structures. This is not wholly
                                // portable and should be remedied... either to include the template
                                // generators in this directive, or as a related service.
                                return FormSvc.renderFormsToHTML(fconfig, nodeId);
                            }

                            function renderRelatedRecords(
                                relatedRecords, 
                                outFields, 
                                fieldTypes, 
                                fieldDomains, 
                                fieldAliases, 
                                friendlyName,
                                relatedSecret,
                                buttonLabels) {
                                var formConfig = {
                                    relatedRecords: relatedRecords,
                                    outFields: outFields,
                                    fieldTypes: fieldTypes,
                                    fieldDomains: fieldDomains,
                                    aliases: fieldAliases,
                                    friendlyName: friendlyName,
                                    relatedSecret: relatedSecret,
                                    buttonLabels: buttonLabels
                                };
                                scope.thtml = '';
                                scope.thtml = angular.element(populateForm(formConfig));

                                $compile(scope.thtml)(scope, function(cloned, scope){
                                    elem.empty(); // Otherwise the append below keeps growing the DOM
                                    elem.append(cloned);
                                });
                                // Forces updates to view despite ArcGIS Dojo stuff not
                                // knowing such stuff exists.
                                UtilSvc.maybeApply();
                            }
                            
                            function gotRelatedRecords(relatedRecords,graphicAttributes) {
                                // The name of the function is a misnomer perhaps because
                                // this is called whether matching related records are
                                // found for a given queried graphic or not.
                                // 
                                var outFields = (featureLayer.relatedFields ? featureLayer.relatedFields : ['objectid']);
                                var fset = relatedRecords[graphicAttributes.objectid];
                                // If fset is not null, there was some sort of related
                                // record found in the query.
                                if (fset) {
                                    if (fset.features) {
                                        scope.resultCount = (fset) ? fset.features.length : 0;
                                        scope.relatedRecords = {};
                                        scope.relatedFieldTypes = featureLayer.relatedFieldTypes;
                                        
                                        for (var c = 0; c < fset.features.length; c++) {
                                            var outFeatSet = {};
                                            outFeatSet['attributes'] = {};
                                            outFeatSet.recordId = fset.features[c].attributes[featureLayer.relatedFieldId];
                                            outFeatSet.objectId = fset.features[c].attributes['objectid'];
                                            for (var i = 0; i < outFields.length; i++) {
                                                outFeatSet.attributes[outFields[i]] = fset.features[c].attributes[outFields[i]];
                                            }
                                            scope.relatedRecords[outFeatSet.objectId] = (outFeatSet);
                                        }
                                        renderRelatedRecords(
                                            scope.relatedRecords,
                                            outFields,
                                            (featureLayer.relatedFieldTypes ? featureLayer.relatedFieldTypes : {}),
                                            (featureLayer.relatedFieldDomains ? featureLayer.relatedFieldDomains : {}),
                                            (featureLayer.relatedFieldAliases ? featureLayer.relatedFieldAliases : {}),
                                            (graphicAttributes[featureLayer['featureFriendlyName']] ? graphicAttributes[featureLayer['featureFriendlyName']] : ''),
                                            (featureLayer.relatedSecret ? featureLayer.relatedSecret : ''),
                                            {
                                                btnadd: (featureLayer.label_buttonAdd ? featureLayer.label_buttonAdd : null),
                                                btndelete: (featureLayer.label_buttonDelete ? featureLayer.label_buttonDelete : null),
                                                btnupdate: (featureLayer.label_buttonUpdate ? featureLayer.label_buttonUpdate : null),
                                                secretDescriptor: (featureLayer.label_secretDescriptor ? featureLayer.label_secretDescriptor : null)
                                            }
                                        );
                                    }
                                }
                                // Otherwise, no related records were found, but we still
                                // want to render the form for the related records to
                                // show the "add new" button and other tools that don't
                                // care if there are existing related records already.
                                else {
                                    scope.resultCount = null;
                                    renderRelatedRecords(
                                        {},
                                        outFields,
                                        (featureLayer.relatedFieldTypes ? featureLayer.relatedFieldTypes : {}),
                                        (featureLayer.relatedFieldDomains ? featureLayer.relatedFieldDomains : {}),
                                        (featureLayer.relatedFieldAliases ? featureLayer.relatedFieldAliases : {}),
                                        (graphicAttributes[featureLayer['featureFriendlyName']] ? graphicAttributes[featureLayer['featureFriendlyName']] : ''),
                                        (featureLayer.relatedSecret ? featureLayer.relatedSecret : ''),
                                        {
                                            btnadd: (featureLayer.label_buttonAdd ? featureLayer.label_buttonAdd : null),
                                            btndelete: (featureLayer.label_buttonDelete ? featureLayer.label_buttonDelete : null),
                                            btnupdate: (featureLayer.label_buttonUpdate ? featureLayer.label_buttonUpdate : null),
                                            secretDescriptor: (featureLayer.label_secretDescriptor ? featureLayer.label_secretDescriptor : null)
                                        }
                                    );
                                }
                            };
                            
                            function getRelatedRecords(graphic) {
                                // Queries the current graphic for any
                                // related records - passing the query
                                // result to the "gotRelatedRecords()"
                                // function.
                                scope.relatedGraphic = graphic;
                                var relatedQuery = new RelationshipQuery();
                                relatedQuery.outFields = ['*'];
                                relatedQuery.relationshipId = 0;
                                var graphicAttributes = graphic.attributes;
                                relatedQuery.objectIds = [graphicAttributes.objectid];
                                scope.relatedFeatureGID = graphicAttributes.globalid;

                                featureLayer.queryRelatedFeatures(
                                    relatedQuery, 
                                    function(relatedRecords) {
                                        gotRelatedRecords(relatedRecords, graphicAttributes);
                                    }
                                );
                            };

                            function clearRelatedRecords() {
                                scope.relatedRecords = null;
                                scope.resultCount = null;

                                scope.thtml = angular.element('<div id="' + nodeId + '" ></div>');
                                $compile(scope.thtml)(scope, function(cloned, scope){ 
                                    elem.html(cloned[0].innerHTML);
                                });
                                UtilSvc.maybeApply();
                            }


                            scope.pause = function() {
                                console.log("scope >> " + JSON.stringify(scope.relatedRecords, null, 2) );
                            };

                            //////////////////////////////////////////////////////////////
                            ///
                            //  [
                            //   {
                            //    "attributes": {
                            //     "objectid": 17,
                            //     "numvote": 1,
                            //     "comments": "At least it will be clean in front of my house!",
                            //     "messlevel": 3,
                            //     "readyforpickup": 0,
                            //     "userid": "Brad The Man",
                            //     "ishidden": 0,
                            //     "greenuptime": "LATEPM",
                            //     "recordid": "{7C8967F3-40F0-4310-B772-3F4872EA26A1}"
                            //    }
                            //   }
                            //  ]
                            ///
                            /////////////////////////////////////////////////////////////

                            scope.addRelated = function(gid) {
                                var relatedSecret = (featureLayer.relatedSecret ? featureLayer.relatedSecret : '');
                                if (relatedSecret != '') {
                                    $rootScope.$broadcast(
                                        'showSecret', 
                                        {
                                            nodeId : nodeId + '_secret', 
                                            gid: gid, 
                                            oid: null,
                                            mode: 'add',
                                            verify: scope.verifySecretFormat
                                        }
                                    );
                                }
                            }

                            scope.updateRelated = function(oid) {
                                var relatedSecret = (featureLayer.relatedSecret ? featureLayer.relatedSecret : '');
                                if (relatedSecret != '') {
                                    $rootScope.$broadcast(
                                        'showSecret', 
                                        {
                                            nodeId : nodeId + '_secret', 
                                            gid: null, 
                                            oid: oid,
                                            mode: 'update',
                                            verify: scope.verifySecretValue
                                        }
                                    );
                                }
                            }

                            scope.deleteRelated = function(oid) {
                                var relatedSecret = (featureLayer.relatedSecret ? featureLayer.relatedSecret : '');
                                if (relatedSecret != '') {
                                    $rootScope.$broadcast(
                                        'showSecret', 
                                        {
                                            nodeId : nodeId + '_secret', 
                                            gid: null, 
                                            oid: oid,
                                            mode: 'delete',
                                            verify: scope.verifySecretValue
                                        }
                                    );
                                }
                            }

                            scope.verifySecretFormat = function(value) {
                                if (!value) return false;
                                var relatedSecret = featureLayer.relatedSecret;
                                var regex = relatedSecret.split(':')[2];
                                var res = value.match(regex);
                                if (res.length < 2) {
                                    return false;
                                }
                                else {
                                    return true;
                                }
                                return false;
                            };

                            scope.verifySecretValue = function(value,oid) {
                                if (!value) return false;
                                if (!oid) return false;
                                var relatedSecret = featureLayer.relatedSecret;
                                var secretValue = scope.relatedRecords[parseInt(oid)].attributes[relatedSecret.split(':')[0]];
                                if (value == secretValue) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                                return false;
                            };

                            scope.addRelatedFinalize = function(gid) {
                                console.log("addRelated(" + gid + ") called!");
                                var updateRecord = {};
                                updateRecord['attributes'] = scope.addRecord.attributes;
                                updateRecord.attributes['recordid'] = scope.relatedFeatureGID;
                                scope.relatedTable.applyEdits([updateRecord], null, null, 
                                    function(deleteResults) {
                                        alert("Congratulations! You've Adopted A Beautiful, Richmond Road!");
                                        resetAddRecord();
                                        $rootScope.$broadcast('mapUpdateRequest',{});
                                        getRelatedRecords(scope.relatedGraphic);
                                    }, 
                                    function(err){
                                        alert(err);
                                    }
                                );
                            };

                            scope.updateRelatedFinalize = function(oid) {
                                console.log("updateRelated(" + oid + ") called!");
                                var updateRecord = {};
                                updateRecord['attributes'] = scope.relatedRecords[oid].attributes;
                                updateRecord.attributes['objectid'] = parseInt(oid);
                                scope.relatedTable.applyEdits(null, [updateRecord], null, 
                                    function(updateResults) {
                                        alert("Your Adoption Record Has Been Updated!");
                                        resetAddRecord();
                                        getRelatedRecords(scope.relatedGraphic);
                                    }, 
                                    function(err){
                                        alert(err);
                                    }
                                );
                            };

                            scope.deleteRelatedFinalize = function(oid) {
                                console.log("deleteRelated(" + oid + ") called!");
                                var updateRecord = {};
                                updateRecord['attributes'] = scope.relatedRecords[oid].attributes;
                                updateRecord.attributes['objectid'] = parseInt(oid);
                                scope.relatedTable.applyEdits(null, null, [updateRecord], 
                                    function(deleteResults) {
                                        alert("Your Adoption Record Has Been Removed! Please Consider Adopting A Road Again In The Future!");
                                        resetAddRecord();
                                        $rootScope.$broadcast('mapUpdateRequest',{});
                                        getRelatedRecords(scope.relatedGraphic);
                                    }, 
                                    function(err){
                                        alert(err);
                                    }
                                );
                            };
                            //======================================================================
                            //
                            resetAddRecord();
                        }
                    };
                }
            ]
        );
    }
);