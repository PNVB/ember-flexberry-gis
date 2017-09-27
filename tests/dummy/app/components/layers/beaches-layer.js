/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from 'ember-flexberry-gis/components/base-layer';

/**
  Beaches layer component for leaflet map.

  @class BeachesLayerComponent
  @extends BaseLayerComponent
 */
export default BaseLayer.extend({
  /**
    Tile service URL.

    @property url
    @type String
    @default null
  */
  url: null,

  /**
    Beaches JSON data URL.

    @property urlJSON
    @type String
    @default null
  */
  urlJSON: 'http://map.visitcrimea.guide/filter/map',   // TODO: add to settings

  /**
    Beaches result data URL.

    @property urlData
    @type String
    @default null
  */
  urlData: 'http://map.visitcrimea.guide',  // TODO: add to settings

  leafletOptions: [
    'minZoom', 'maxZoom', 'maxNativeZoom', 'tileSize', 'subdomains',
    'errorTileUrl', 'attribution', 'tms', 'continuousWorld', 'noWrap',
    'zoomOffset', 'zoomReverse', 'opacity', 'zIndex', 'unloadInvisibleTiles',
    'updateWhenIdle', 'detectRetina', 'reuseTiles', 'bounds', 'geometryField'
  ],

  /**
  Group Layer storing data get while creating layer

  @property _beachLayer
  @type L.layerGroup
  @default null
  */
  _beachLayer: null,

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    let thisRef = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        type: 'get',
        url: this.get('urlJSON'),
        dataType: 'json',
        success: function (response) {
          let layer = L.layerGroup();
          let clusterLayer = L.markerClusterGroup();
          let points = response.points;
          for (let i = 0; i < points.length; i++) {
            let marker = L.marker([points[i].lat, points[i].lng]);
            marker.properties = {
              'hintheader': points[i].hintHeader,
              'header': points[i].header.replace('href=\"', 'href=\"'.concat(thisRef.get('urlData'))),
              'body': points[i].body.replace('href=\"', 'href=\"'.concat(thisRef.get('urlData'))).replace('src=\"', 'src=\"'.concat(thisRef.get('urlData'))),
              'color': points[i].color
            };
            layer.addLayer(marker);
            clusterLayer.addLayer(marker);
          }

          let poligons = response.poligons;
          for (let i = 0; i < poligons.length; i++) {
            let latlngs = JSON.parse(poligons[i].data);

            //if response.poligons does not contain empty 'data' values
            if (Array.isArray(latlngs[0]) && latlngs[0].length) {
              let polygon = L.polygon(latlngs);
              polygon.properties = {
                'hintheader': poligons[i].hintHeader,
                'header': poligons[i].header.replace('href=\"', 'href=\"'.concat(thisRef.get('urlData'))),
                'body': poligons[i].body.replace('href=\"', 'href=\"'.concat(thisRef.get('urlData')))
                  .replace('src=\"', 'src=\"'.concat(thisRef.get('urlData'))),
                'color': poligons[i].color
              };
              layer.addLayer(polygon);
              clusterLayer.addLayer(polygon);
            }
          }

          thisRef.set('_beachLayer', layer);
          resolve(clusterLayer);
        }
      });
    });
  },

  /**
  Handles 'flexberry-map:identify' event of leaflet map.

  @method _identify
  @param {Object} e Event object.
  @param {<a href="http://leafletjs.com/reference-1.0.0.html#rectangle">L.Rectangle</a>} e.boundingBox Leaflet layer
  representing bounding box within which layer's objects must be identified.
  @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the bounding box.
  @param {Object[]} layers Objects describing those layers which must be identified.
  @param {Object[]} results Objects describing identification results.
  Every result-object has the following structure: { layer: ..., features: [...] },
  where 'layer' is metadata of layer related to identification result, features is array
  containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
  or a promise returning such array.
  */
  identify(e) {
    // identification bounds
    var bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());

    let groupLayer = this.get('_beachLayer');

    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      groupLayer.eachLayer(function(layer) {
        let feature = layer.toGeoJSON();
        let primitive = new Terraformer.Primitive(feature.geometry);

        // used for Zoom to and Pan to each feature
        let l = L.geoJSON(feature);
        feature.properties = layer.properties;

        if (primitive instanceof Terraformer.Point ? primitive.within(bounds) : (primitive.intersects(bounds) || primitive.within(bounds))) {
          feature.leafletLayer = l;
          features.pushObject(feature);
        }
      });
      resolve(features);
    });
  },

  /**
    Handles 'flexberry-map:search' event of leaflet map.

    @method search
    @param {Object} e Event object.
    @param {<a href="http://leafletjs.com/reference-1.0.0.html#latlng">L.LatLng</a>} e.latlng Center of the search area.
    @param {Object[]} layer Object describing layer that must be searched.
    @param {Object} searchOptions Search options related to layer type.
    @param {Object} results Hash containing search results.
    @param {Object[]} results.features Array containing (GeoJSON feature-objects)[http://geojson.org/geojson-spec.html#feature-objects]
    or a promise returning such array.
  */
  search(e) {
    let groupLayer = this.get('_beachLayer');

    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      groupLayer.eachLayer(function(layer) {
        let feature = layer.toGeoJSON();
        let l = L.geoJSON(feature);
        feature.properties = layer.properties;

        // if layer satisfies search query
        if (feature.properties.hintheader.includes(e.searchOptions.queryString)) {
          feature.leafletLayer = l;
          features.pushObject(feature);
        }
      });
      resolve(features);
    });
  }
});
