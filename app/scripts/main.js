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
 | File: main.js
 | Description: Stone Angular app main file.
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* global angular:true */
"use strict";
define([
  // THIS
  'angularMapApp/main',
  // SERVICES
  'angularMapApp/services/map_service',
  'angularMapApp/services/form_service', // fOrm
  'angularMapApp/services/base64_service',
  'angularMapApp/services/util_service',
  // CONTROLLERS
  'angularMapApp/controllers/LandingPageController',
  'angularMapApp/controllers/MapPageController',
  // DIRECTIVES
  'angularMapApp/directives/seMap',
  'angularMapApp/directives/seHeader',
  'angularMapApp/directives/seFooter',
  'angularMapApp/directives/seModal',
  'angularMapApp/directives/seMapAttachmentEditor',
  'angularMapApp/directives/seMapRelatedRecords',
  'angularMapApp/directives/ngConvertToNumber',
  'angularMapApp/directives/seRegexFilter'
	], function (main) {

	    var angularMapApp = angular.module('angularMapApp', [
        // ANGULAR provided
        'ngCookies',
        'ngAnimate',
        'ngSanitize',
        // Third Party
        'ui.router',
        'ct.ui.router.extras',
        // Stone SERVICES
        'formService',
        'mapService',
        'base64Service',
        'utilService',
        // Stone CONTROLLERS
        'LandingPageController',
        'MapPageController',
        // Stone _BIG_ DIRECTIVES (pages, major forms)
        'seMap',
        // Stone _SMALL_ DIRECTIVES (controls, popups, small forms)
        'seHeader',
        'seFooter',
        'seModal',
        'seMapAttachmentEditor',
        'seMapRelatedRecords',
        // Stone _INVISIBLE_ DIRECTIVES (never seen by user)
        'nonStringSelect',
        'regexFilters'
        ])
        .config(
          function ($stateProvider, $urlRouterProvider, $provide, $httpProvider, $sceDelegateProvider) {
            $sceDelegateProvider.resourceUrlWhitelist(['self', '**']);
            $stateProvider
                .state('map', {
                  url: '/map',
                  templateUrl: 'views/pages/mapPage.html',
                  controller: 'MapPageController'
                });
            $stateProvider
                .state('landing', {
                  url: '/landing',
                  templateUrl: 'views/pages/landingPage.html',
                  controller: 'LandingPageController'
                });
            $urlRouterProvider.otherwise('/landing');
          }
        );

	    return angularMapApp;
	}
);