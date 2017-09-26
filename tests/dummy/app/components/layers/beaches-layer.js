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

  //TODO: delete not required options
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
    let thisReference = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        type: 'get',
        //url: Ember.get('settings', urlJSON),
        url: 'http://localhost:3000/db',
        dataType: 'json',
        success: function (response) {
          let layer = L.layerGroup();
          let clusterLayer = L.markerClusterGroup();
          for (let i = 0; i < response.points.length; i++) {
            let marker = L.marker([response.points[i].lat, response.points[i].lng]);
            marker.properties = {
              'hintheader': response.points[i].hintHeader,
              'header': response.points[i].header.replace('href=\"', 'href=\"'.concat('http://map.visitcrimea.guide')),
              'body': response.points[i].body.replace('href=\"', 'href=\"'.concat('http://map.visitcrimea.guide')).replace('src=\"', 'src=\"'.concat('http://map.visitcrimea.guide')),
              'color': response.points[i].color
            };
            layer.addLayer(marker);
            clusterLayer.addLayer(marker);
          }

          for (let i = 0; i < response.poligons.length; i++) {
            let latlngs = JSON.parse(response.poligons[i].data);

            //if response.poligons does not contain empty 'data' values
            if (Array.isArray(latlngs[0]) && latlngs[0].length ) {
              let polygon = L.polygon(latlngs);
              polygon.properties = {
                'hintheader': response.poligons[i].hintHeader,
                'header': response.poligons[i].header.replace('href=\"', 'href=\"'.concat('http://map.visitcrimea.guide')),
                'body': response.poligons[i].body.replace('href=\"', 'href=\"'.concat('http://map.visitcrimea.guide')).replace('src=\"', 'src=\"'.concat('http://map.visitcrimea.guide')),
                'color': response.poligons[i].color
              };
              layer.addLayer(polygon);
              clusterLayer.addLayer(polygon);
            }
          }

          thisReference.set('_beachLayer', layer);
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

    //console.log("grouplayer: "+ groupLayer);
    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      groupLayer.eachLayer(function(layer) {
        let feature = layer.toGeoJSON();
        let primitive = new Terraformer.Primitive(feature.geometry);

        // used for Zoom to and Pan to each feature
        let l = L.geoJSON(feature);
        feature.properties = layer.properties;

        if (primitive instanceof Terraformer.Point? primitive.within(bounds) : (primitive.intersects(bounds) || primitive.within(bounds))) {
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
