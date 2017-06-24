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
 | Authors: Based on work by Patrick Arlt - parlt@esri.com (originator)
 |          Nick Floersch - nick@stone-env.com (adopter)
 |          Alan Hammersmith - ahammersmith@stone-env.com
 | File: seMap.js
 | Description: A wrapper around the Esri Map dijit for Angular
 \ =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */
/* global angular:true */
'use strict';
define([
	'angularMapApp/directives/seMap', 	// These defines MUST match 
	'dojo/_base/connect',				// the order of the function params below!!!
	'dojo/dom',
	'dojo/parser',
	'dojo/on',
	'dojo/_base/Color',
	'dijit/layout/BorderContainer',
	'dijit/layout/ContentPane',
	'dojo/fx',
	'esri/dijit/Basemap',
	'esri/dijit/BasemapLayer',
	'esri/dijit/BasemapToggle',
	'esri/dijit/Scalebar',
	'esri/dijit/OverviewMap',
	'esri/dijit/Geocoder',
	'esri/dijit/BasemapGallery',
	"esri/dijit/Popup",
	"esri/dijit/PopupTemplate",
	"esri/dijit/AttributeInspector",
	"esri/dijit/LocateButton",
	'esri/graphic',
	'esri/InfoTemplate',
	'esri/Color',
	'esri/SpatialReference',
	'esri/map',
	'esri/basemaps',
	'esri/geometry/Extent',
	'esri/geometry/geometryEngine',
	'esri/geometry/Point',
	'esri/geometry/Polygon',
	'esri/geometry/webMercatorUtils',
	'esri/layers/ArcGISTiledMapServiceLayer',
	'esri/layers/ArcGISDynamicMapServiceLayer',
	'esri/layers/ArcGISImageServiceLayer',
	'esri/layers/FeatureLayer',
	'esri/layers/GraphicsLayer',
	'esri/layers/ImageParameters',
	'esri/layers/LabelLayer',
	'esri/renderers/ClassBreaksRenderer',
	'esri/renderers/SimpleRenderer',
	'esri/symbols/Font',
	'esri/symbols/SimpleMarkerSymbol',
	'esri/symbols/SimpleLineSymbol',
	'esri/symbols/SimpleFillSymbol',
	'esri/symbols/TextSymbol',
	'esri/symbols/PictureMarkerSymbol',
	'esri/symbols/CartographicLineSymbol',
	'esri/tasks/locator',
	'esri/tasks/Geoprocessor',
	'esri/tasks/PrintTask',
	'esri/tasks/PrintParameters',
	'esri/tasks/PrintTemplate',
	'esri/tasks/query',
	'esri/tasks/QueryTask',
	'esri/toolbars/draw',
	'esri/toolbars/edit'
	// 'agsjs/dijit/TOC'
], function (
	seMap,
	connect,
	dom,
	parser,
	on,
	Color,
	BorderContainer,
	ContentPane,
	fx,
	Basemap,
	BasemapLayer,
	BasemapToggle,
	Scalebar,
	OverviewMap,
	Geocoder,
	BasemapGallery,
	Popup,
	PopupTemplate,
	AttributeInspector,
	LocateButton,
	Graphic,
	InfoTemplate,
	esriColor,
	SpatialReference,
	Map,
	esriBasemaps,
	Extent,
	geometryEngine,
	Point,
	Polygon,
	webMercatorUtils,
	ArcGISTiledMapServiceLayer,
	ArcGISDynamicMapServiceLayer,
	ArcGISImageServiceLayer,
	FeatureLayer,
	GraphicsLayer,
	ImageParameters,
	LabelLayer,
	ClassBreaksRenderer,
	SimpleRenderer,
	Font,
	SimpleMarkerSymbol,
	SimpleLineSymbol,
	SimpleFillSymbol,
	TextSymbol,
	PictureMarkerSymbol,
	CartographicLineSymbol,
	Locator,
	Geoprocessor,
	PrintTask,
	PrintParameters,
	PrintTemplate,
	Query,
	QueryTask,
	Draw,
	Edit
    // TOC
) {

		var module = angular.module('seMap', []);

		module.directive('seMap', ['$rootScope', '$compile', '$window', '$filter', 'MapSvc', '$state',
			function ($rootScope, $compile, $window, $filter, MapSvc, $state) {
				// this object will tell angular how our directive behaves
				return {
					// only allow seMap to be used as an element (<se-map>)
					restrict: 'E',
					scope: { mapConfig: '='},
					templateUrl: './views/directives/seMap.html',
					// define how our template is compiled this gets the $element our directive is on as well as its attributes ($attrs)
					compile: function ($element, $attrs) {
						// remove the id attribute from the main element
						$element.removeAttr('id');
						return function (scope, element, attrs, controller) {
							scope.id = (attrs.id) ? attrs.id : 'map';
							angular.element( document.querySelector( '#mapBox' ) ).append('<div id="' + scope.id + '" class="map"><div id="LocateButton"></div></div>');
							//element.append('<div id="' + scope.id + '" class="map"></div>');
							controller.init(scope.id);
							//console.log("scope.id: " + scope.id);
							//// THIS BULLSHIT IS TO GET THE MAP TO RESIZE
							//// WHEN THE FLEXBOX RESIZES - UGH
							var w = angular.element($window);
							w.bind('resize', function () {
								//console.log("element:" + JSON.stringify(element));
								var elem = document.getElementById("map_root");
								elem.style.display = 'none';
								elem.style.height = elem.offsetHeight; // no need to store this anywhere, the reference is enough
								elem.style.display = 'flex';
							});
						};
					},
					//////////////////////////////////////////////////////////////////////////
					//////////////////////////////////////////////////////////////////////////
					//////////////////////////////////////////////////////////////////////////
					controller: function ($scope, $element, $attrs, $compile) {
						$scope.mapLyrs = [];
						$scope.basemapList = [];
						$scope.basemapFilter = { isBasemap: false };
						$scope.layersToRefreshOnBroadcast = [];

						var mapOptions;
						var id;
						var map;
						var basemapToggle;
						var basemapGallery;

						var selectableFeatureLayers = [];

						var myFuncs = {};

						$rootScope.$on('$stateChangeStart',
							function (event, toState, toParams, fromState, fromParams) {
								if (fromState.name == 'map') {
									// the basemapToggle dijit prevents the map from 
									// initializing when coming back a 2nd time,
									// so destory it when we leave the map
									basemapToggle.destroy();
								}
							}
						);

						$scope.$on('$destroy', function () {
							console.log("[seMap] Destroyed!");
						});


						$scope.refreshMapLayers = function(evt) {
							for (var i = 0; i < $scope.layersToRefreshOnBroadcast.length; i++) {
								var lyr = $scope.layersToRefreshOnBroadcast[i];
								lyr.refresh();
								lyr.redraw();
							}
						};

						myFuncs.makeLyr = function (cfg) {
							var lyr;
							var lyrOpts = {};
							lyrOpts.id = cfg.id;
							if (cfg.hasOwnProperty('visible'))
								lyrOpts.visible = cfg.visible;
							if (cfg.opacity)
								lyrOpts.opacity = cfg.opacity;
							switch (cfg.type) {
								case 'img':
									lyr = new ArcGISImageServiceLayer(cfg.url, lyrOpts);
									break;
								case 'dyn':
									var imageParameters = new ImageParameters();
									imageParameters.format = "png24";
									lyrOpts.imageParameters = imageParameters;
									lyr = new ArcGISDynamicMapServiceLayer(cfg.url, lyrOpts);
									lyr.isBasemap = false;
									if (cfg.lyrIds && cfg.lyrIds.length)
										lyr.setVisibleLayers(cfg.lyrIds);
									break;
								case 'tile':
									lyr = new ArcGISTiledMapServiceLayer(cfg.url, lyrOpts);
									break;
								case 'feat':
									lyrOpts.mode = FeatureLayer.MODE_ONDEMAND;
									lyrOpts.outFields = ['*'];
									lyr = new FeatureLayer(cfg.url, lyrOpts);
									if (cfg.listenForRefresh) $scope.layersToRefreshOnBroadcast.push(lyr);
									lyr.baseUrl = (cfg.url).substring(0,(cfg.url).lastIndexOf('/'));
									// var cls = new CartographicLineSymbol(null, null, null, CartographicLineSymbol.CAP_ROUND, CartographicLineSymbol.JOIN_MITER, null);
									// var sr = new SimpleRenderer(cls);
									// lyr.setRenderer(sr);
									var selectionSymbol = new SimpleLineSymbol().setColor(new Color([0,255,255,1])).setWidth(8);
									lyr.setSelectionSymbol(selectionSymbol);
									if (cfg.isSelectable) selectableFeatureLayers.push(lyr);
									lyr.relatedFields = cfg.relatedFields ? cfg.relatedFields : [];
									lyr.relatedFieldTypes = cfg.relatedFieldTypes ? cfg.relatedFieldTypes : {};
									lyr.relatedFieldDomainPromise = cfg.relatedFieldDomains ? cfg.relatedFieldDomains
										.then(
			                                function(data) {
			                                    lyr.relatedFieldDomains = data;
			                                },
			                                function(err) {
			                                    lyr.relatedFieldDomains = {};
			                                }
			                            ) : {};
			                        lyr.relatedFieldAliasPromise = cfg.relatedFieldAliases ? cfg.relatedFieldAliases
										.then(
			                                function(data) {
			                                    lyr.relatedFieldAliases = data;
			                                },
			                                function(err) {
			                                    lyr.relatedFieldAliases = {};
			                                }
			                            ) : {};
									lyr.relatedFieldId = cfg.relatedFieldId ? cfg.relatedFieldId : 'globalid';
									lyr.featureFriendlyName = cfg.featureFriendlyName;
									lyr.relatedSecret = cfg.relatedSecret;
									lyr.label_buttonAdd = cfg.label_buttonAdd;
                        			lyr.label_secretDescriptor = cfg.label_secretDescriptor;
									break;
								default:
									break;
							}
							if (lyr) {
								lyr.label = cfg.label;
								lyr.lyrOpacity = cfg.opacity;
							}
							return lyr;
						}

						// var nullGraphic = {
						// 	"geometry": { x: 0, y: 0, spatialReference: { wkid: 102100 } },
						// 	"attributes": {},
						// 	"symbol": MapSvc.getSymbol('nullPoint')
						// };

						$scope.clearGraphics = function () {
							$scope.graphicArea = 0;
							map.graphics.clear();
							map.graphics.add(new Graphic(nullGraphic));// if graphics are totally cleared, the webMapAsJson doesn't contain a graphics layer to add to
							map.graphics.redraw();
						}

						$scope.$on('mapUpdateRequest', function(evt, data) {
							console.log("[seMap] refreshed listening feature layers!");
							$scope.refreshMapLayers(evt)
						});


						this.init = function (tId) {
							
							$scope.id = tId ? tId : 'map';
							$scope.uid = $scope.id;
							
							// tell the ArcGIS API that we support CORS since we're not using any AGS map services in this map
							esriConfig.defaults.io.corsEnabledServers.push("geodata104-www.stone-env.net");

							//////////////////////////////////////////////////////////////////////
							// Create the Map
							//////////////////////////////////////////////////////////////////////
							var initCenter = ($scope.mapConfig.initCenter) ? new Point({
								x: $scope.mapConfig.initCenter[0],
								y: $scope.mapConfig.initCenter[1],
								spatialReference: {
									wkid: 4326
								}
							}) : [0, 0];
							mapOptions = {
								center: initCenter,
								zoom: $scope.mapConfig.initZoom,
								basemap: $scope.mapConfig.basemaps[0].id ? $scope.mapConfig.basemaps[0].id : $scope.mapConfig.basemaps[0].toLowerCase(),
								logo: false,
								sliderPosition: 'top-left'
							};
							map = new Map($scope.uid, mapOptions);

							setTimeout( function() {
							        map.resize();
							        map.reposition();
							      }, 500);

							// setTimeout(function () {
							// 	//console.log("PING");
							// 	//// AFTER MAP LOADS THE MAPROOT NEEDS TO
							// 	//// TRIGGER A REFLOW OF THE FLEXBOX. WHY?????
							// 	///
							// 	var w = angular.element($window);

							// 	var elemVC = document.getElementById("view-container");
							// 	var elemMR = document.getElementById("map_root");
							// 	elemVC.style.display = 'none';
							// 	elemVC.style.height = elemVC.offsetHeight; // no need to store this anywhere, the reference is enough

							// 	elemVC.style.display = 'flex';
							// 	console.log("view-container offsetHeight: " + elemVC.offsetHeight);
							// 	console.log("map_root offsetHeight: " + elemMR.offsetHeight);

							// 	if (elemVC.offsetHeight != elemMR.offsetHeight) {
							// 		setTimeout(function () {
							// 			elemMR.style.display = 'none';
							// 			elemMR.style.height = elemMR.offsetHeight; // no need to store this anywhere, the reference is enough
							// 			elemMR.style.display = 'flex';
							// 		}, 100);
							// 	}

							// }, 100);

							map.enableScrollWheelZoom();

							/////////////////////////////////
							// LAYERS
							/////////////////////////////////
							var mapLyrs = [];
							// ***BASEMAPS***

							// ***LAYERS***
							for (var j = 0; j < $scope.mapConfig.layers.length; j++) {
								var lyrItem = $scope.mapConfig.layers[j];
								var lyr = myFuncs.makeLyr(lyrItem);
								mapLyrs.push(lyr);
							}
							// ADD THE LAYERS
							$scope.mapLyrs = mapLyrs;

							map.addLayers($scope.mapLyrs);

							//===== Map Events ========================================

							map.on('click', function(evt) {
								mapClick(evt);
							});

							//////////////////////////////////////////////////////////////////////
							// Define Dijits
							//////////////////////////////////////////////////////////////////////

							// basemapToggle = new BasemapToggle({
							//     map: map,
							//     basemap: "dark-gray-vector"
							// }, "BasemapToggle");
							// basemapToggle.startup();

							// var darkGrayBasemapLayer = new BasemapLayer({
							// 	url: "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer"
							// });
							// var darkGrayBasemap = new Basemap({
							// 	layers: [darkGrayBasemapLayer],
							// 	title: "Dark Gray Basemap",
							// 	thumbnailUrl: ""
							// });
							// var streetsBasemapLayer = new BasemapLayer({
							// 	url: "http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer"
							// });
							// var streetsBasemap = new Basemap({
							// 	layers: [streetsBasemapLayer],
							// 	title: "Streets Basemap",
							// 	thumbnailUrl: ""
							// });
							// var imageryBasemapLayer = new BasemapLayer({
							// 	url: "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer"
							// });
							// var imageryBasemap = new Basemap({
							// 	layers: [imageryBasemapLayer],
							// 	title: "Imagery Basemap",
							// 	thumbnailUrl: ""
							// });


							basemapGallery = new BasemapGallery({
								map: map,
								showArcGISBasemaps: true
							}, "BasemapToggle");
							basemapGallery.startup();

							var geoLocate = new LocateButton({
								map: map,
								highlightLocation: true
								}, "LocateButton"
							);
							geoLocate.startup();

							

							//////////////////////////////////////////////////////////////////////
							// Startup Dijits
							//////////////////////////////////////////////////////////////////////
							//overviewMapDijit.startup();
							MapSvc.setMap($scope.id,this);
						};
						//////////////////////////////////////////////////////////////////////
						// Define "API" methods for this directive instance
						//////////////////////////////////////////////////////////////////////
						function mapClick(evt) {
							console.log("Map Click Event: " + evt);

							var qry = new Query();
							
							
							for (var i = 0; i < selectableFeatureLayers.length; i++) {
								if (evt.graphic == null) {
									MapSvc.getScope('relatedRecords').$broadcast("featureSelectClear");
									//MapSvc.getScope('attachmentEditor').$broadcast("featureSelectClear");
									selectableFeatureLayers[i].clearSelection();
									continue;
								}

								qry.geometry = evt.graphic.geometry;
								qry.spatialRelationship = Query.SPATIAL_REL_CONTAINS;
								qry.maxAllowableOffset = 0;
								selectableFeatureLayers[i].selectFeatures(
									qry,
									FeatureLayer.SELECTION_NEW,
									function(ret) {
										//alert("select success: " + ret);
									},
									function(err) {
										alert("select error: " + err);
									});
								
								MapSvc.getScope('relatedRecords').$broadcast("featureSelectClick", evt);
								//MapSvc.getScope('attachmentEditor').$broadcast("featureSelectClick", evt);
							}


						}

						this.getMap = function () {
							return map;
						};

						this.getLayer = function(layerId) {
							var tLayer = map.getLayer(layerId);
							return tLayer;
						};

					} // END CONTROLLER
				};
			}]); // END DIRECTIVE

		return module;
	});
