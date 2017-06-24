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
 | File: form_service.js
 | Description: An Angular service to provide state and function
 |              for various web forms.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
'use strict';
define([
    'angularMapApp/services/form_service'
], function (form_service) {
    var module = angular.module('formService', []);

    module.factory('FormSvc', ['$http', '$filter', '$rootScope', '$q', 'UtilSvc',
        function ($http, $filter, $rootScope, $q, UtilSvc ) {
            var urlConfig = "";
            var URLROOT = "";
            var _formConfigs = {};

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
                        URLROOT = "http://vtpartners.stone-env.net:8888/";
                    }
                );
            }
            _setConfig();

            function _maybeApply() {
                if ($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest') {
                    $rootScope.$apply();
                }
            }

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


            function _renderCheckBox(field,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<span class="relatedRecordCheckBox">';
                if (isSecret) {

                    outHTML += '{{' + model + '}}';
                }
                else {
                    outHTML += '<input type="checkbox" ng-true-value=1 ng-false-value=0 ng-model="' + model + '"></input>'    
                }
                
                outHTML += '</span>';
                return outHTML;
            };

            function _renderText(field,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<span class="relatedRecordTextValue">';
                if (isSecret) {
                    var regex = relatedSecret.split(':')[2];
                    outHTML += '<pattern-filter-front ng-model="' + model + '" ng-regex="' + regex + '">';
                    outHTML += '{{' + model +'}}</pattern-filter-front>';
                }
                else {
                    outHTML += '<input type="text" ng-model="' + model + '"></input>'
                }
                outHTML += '</span>';
                return outHTML;
            };

            function _renderTextArea(field,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<span class="relatedRecordTextValue">';
                if (isSecret) {
                    var regex = relatedSecret.split(':')[2];
                    outHTML += '<pattern-filter-front ng-model="' + model + '" ng-regex="' + regex + '">';
                    outHTML += '{{' + model +'}}</pattern-filter-front>';
                }
                else {
                    outHTML += '<textarea ng-model="' + model + '"></textarea>'
                }
                outHTML += '</span>';
                return outHTML;
            };

            function _renderNumber(field,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<span class="relatedRecordNumberValue">';
                if (isSecret) {
                    outHTML += '{{' + model + '}}';
                }
                else {
                    outHTML += '<input type="number" ng-model="' + model + '"></input>'
                }
                outHTML += '</span>';
                return outHTML;
            };

            //////////////////////////////////////////////////////////////////
            // {
            //     "codedValues": [
            //         {
            //             "code": 1,
            //             "name": "NothingorAlmostnothingFound"
            //         },
            //         {...}
            //     ],
            //     "name": "Messiness",
            //     "type": "codedValue"
            // }
            /////////////////////////////////////////////////////////////
            function _renderNumberDropdown(field,domain,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<select ng-model="' +  model + '" convert-to-number>';
                if (isSecret) {
                    outHTML += '{{' + model + '}}';
                }
                else {
                    outHTML += '<option value=></option>';
                    for (var i = 0; i < domain.codedValues.length; i++) {
                        outHTML += '<option value="' + domain.codedValues[i].code + '">';
                        outHTML += domain.codedValues[i].name;
                        outHTML += '</option>'
                    }
                }
                outHTML += '</select>';
                return outHTML;
            };

            function _renderTextDropdown(field,domain,model,relatedSecret) {
                var isSecret = false;
                if (field == relatedSecret.split(':')[0]) isSecret = true;
                var outHTML = '<select ng-model="' +  model + '">';
                if (isSecret) {
                    outHTML += '{{' + model + '}}';
                }
                else {
                    outHTML += '<option value=""></option>';
                    for (var i = 0; i < domain.codedValues.length; i++) {
                        outHTML += '<option value="' + domain.codedValues[i].code + '">';
                        outHTML += domain.codedValues[i].name;
                        outHTML += '</option>'
                    }
                }
                outHTML += '</select>';
                return outHTML;
            };

            function _renderField(field,model,formConfigs,getSecret) {
                var outHTML = '';

                var relatedSecret = formConfigs['relatedSecret'];
                if (getSecret) relatedSecret = '::';

                switch(formConfigs['fieldTypes'][field]) {
                    case 'checkbox':
                        outHTML += _renderCheckBox(field,model,relatedSecret);
                        break;
                    case 'text':
                        outHTML += _renderText(field,model,relatedSecret);
                        break;
                    case 'textarea':
                        outHTML += _renderTextArea(field,model,relatedSecret);
                        break;
                    case 'number:domain':
                        outHTML += _renderNumberDropdown(field,formConfigs['fieldDomains'][field],model,relatedSecret);
                        break;
                    case 'text:domain':
                        outHTML += _renderTextDropdown(field,formConfigs['fieldDomains'][field],model,relatedSecret);
                        break;
                    case 'number':
                        outHTML += _renderNumber(field,model,relatedSecret);
                        break;
                    default:
                        outHTML += field;
                };

                return outHTML;
            }

            return {
                renderFormsToHTML: function(formConfigs, nodeId) {
                    //console.log('renderFormsToHTML(' + JSON.stringify(formConfigs, null, 2) + ')');
                    var outHTML = '';

                    _formConfigs = formConfigs; // Save for later use to render secret question form

                    outHTML += '<div class="relrec_addNewFormWrapper">';
                    outHTML += '<div class="relrec_header">';
                    if (formConfigs['friendlyName']) outHTML += '<div class="relrec_friendlyName">' + formConfigs['friendlyName'] + '</div>';
                    outHTML += '<div class="relrec_header1">Adopt This Road!</div>';
                    outHTML += '<div class="relrec_header2">More Than 1 Person Can Adopt The Road!</div>';
                    outHTML += '</div>';
                    for (var field in formConfigs['outFields']) {
                            var fieldName = formConfigs['outFields'][field];
                            if (fieldName == (formConfigs['relatedSecret']).split(':')[0]) continue;
                            var fieldAlias = null;
                            if (formConfigs['aliases'] != {}) {
                                if (formConfigs['aliases'][fieldName]) {
                                    fieldAlias = formConfigs['aliases'][fieldName];
                                }
                            }
                            //var record = formConfigs['relatedRecords'][objectId];
                            var model = "addRecord.attributes['" + fieldName + "']"; 
                            outHTML += '<div class="relrec_fieldWrapper">';
                            outHTML += '<span class="relrec_fieldName">' + (fieldAlias ? fieldAlias : fieldName) + '</span>';
                            outHTML += _renderField(fieldName, model, formConfigs, false);
                            outHTML += '</div>';
                        }
                    outHTML += '<button class="buttonGray relatedRecordButton button" ng-click="addRelated(relatedFeatureGID)">';
                    outHTML += (formConfigs['buttonLabels']['btnadd'] ? formConfigs['buttonLabels']['btnadd'] : 'Add');
                    outHTML += '</button>';
                    outHTML += '</div>';

                    outHTML += '<div id="' + nodeId + '" class="relrec_dynamicWrapper">';
                    outHTML += '<div class="relrec_recordList">';
                    outHTML += '<div class="relrec_header"><span class="relrec_header2"># Adoptions for this section of road: {{(resultCount ? resultCount : 0)}}</span></div>';
                    for (var objectId in formConfigs['relatedRecords']) {
                        outHTML += '<div class="relrec_record">';
                        for (var field in formConfigs['outFields']) {
                            var fieldName = formConfigs['outFields'][field];
                            
                            var fieldAlias = null;
                            if (formConfigs['aliases'] != {}) {
                                if (formConfigs['aliases'][fieldName]) {
                                    fieldAlias = formConfigs['aliases'][fieldName];
                                }
                            }
                            //var record = formConfigs['relatedRecords'][objectId];
                            var model = "relatedRecords['" + objectId + "'].attributes['" + fieldName + "']";
                            
                            outHTML += '<div class="relrec_fieldWrapper">';
                            outHTML += '<span class="relrec_fieldName">' + (fieldAlias ? fieldAlias : fieldName) + '</span>';
                            outHTML += _renderField(fieldName, model, formConfigs, false);
                            outHTML += '</div>';
                        }
                        outHTML += '<div class="relrec_footer">';
                        outHTML += '<button class="buttonGray relatedRecordButton button" ng-click="updateRelated(' + objectId + ')">';
                        outHTML += (formConfigs['buttonLabels']['btnupdate'] ? formConfigs['buttonLabels']['btnupdate'] : 'Update');
                        outHTML += '</button>';
                        outHTML += '<button class="buttonGray relatedRecordButton button" ng-click="deleteRelated(' + objectId + ')">';
                        outHTML += (formConfigs['buttonLabels']['btndelete'] ? formConfigs['buttonLabels']['btndelete'] : 'Delete');
                        outHTML += '</button>';
                        outHTML += '</div>';
                        outHTML += '</div>';
                    }
                    
                    outHTML += '</div>';


                    return outHTML;
                },
                renderSecretToHTML: function(nodeId,id,mode) {
                    var outHTML = '';
                    outHTML += '<div id="' + nodeId + '" class="relrec_dynamicWrapper">';

                    outHTML += '<div class="relrec_header">';   
                    outHTML += '<div class="relrec_header1">Save/Update Record</div>';
                    outHTML += '<div class="relrec_header2">';
                    outHTML += '<p>Please Enter ' + _formConfigs['buttonLabels']['secretDescriptor'] + ' ' + _formConfigs['relatedSecret'].split(':')[1] + ' To Save This Record.</p>';
                    outHTML += '<p>If You Wish To Edit This Record Later You Will Need To Use The ' + _formConfigs['relatedSecret'].split(':')[1] + ' As A Password.</p></div>';
                    outHTML += '</div>';

                    outHTML += '<div class="relrec_record">';
                    
                    var fieldName = _formConfigs['relatedSecret'].split(':')[0];
                    
                    var fieldAlias = null;
                    if (_formConfigs['aliases'] != {}) {
                        if (_formConfigs['aliases'][fieldName]) {
                            fieldAlias = _formConfigs['aliases'][fieldName];
                        }
                    }
                    //var record = _formConfigs['relatedRecords'][id];
                    var model = "addRecord.attributes['" + fieldName + "']"; 
                    
                    outHTML += '<div class="relrec_fieldWrapper">';
                    outHTML += '<span class="relrec_fieldName">' + (fieldAlias ? fieldAlias : fieldName) + '</span>';
                    outHTML += _renderField(fieldName, model, _formConfigs, true);
                    outHTML += '</div>';
                    outHTML += '<button class="buttonGray relatedRecordButton button" ng-click="close(' + model + ',\'' + id + '\',\'' +  mode +'\')">';
                    outHTML += (_formConfigs['buttonLabels']['btn' + mode] ? _formConfigs['buttonLabels']['btn' + mode] : UtilSvc.capitalize(mode));
                    outHTML += '</button>';

                    outHTML += '</div>';

                    outHTML += '</div>';
                    return outHTML;
                }
            };
        }
    ]);
    
    return module;
});
