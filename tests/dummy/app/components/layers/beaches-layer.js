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

  _beachLayer: null,

  /**
    Creates leaflet layer related to layer type.

    @method createLayer
    @returns <a href="http://leafletjs.com/reference-1.0.1.html#layer">L.Layer</a>|<a href="https://emberjs.com/api/classes/RSVP.Promise.html">Ember.RSVP.Promise</a>
    Leaflet layer or promise returning such layer.
  */
  createLayer() {
    var thisReference = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        type: 'get',
        url: 'http://localhost:3000/db',
        dataType: 'json',
        success: function (response) {
          console.log(response);
          let layer = L.layerGroup();
          let clusterLayer = L.markerClusterGroup();
          for (let i = 0; i < response.points.length; i++) {
            let marker = L.marker([response.points[i].lat, response.points[i].lng]);
            marker.properties = { 'body': response.points[i].body, 'header': response.points[i].header, 'hintheader': response.points[i].hintHeader };
            layer.addLayer(marker);
            clusterLayer.addLayer(marker);
          }

          for (let i = 0; i < response.poligons.length; i++) {
            let latlngs = response.poligons[i].data;

            //if response.poligons contains empty 'data' values
            if (latlngs !== "[ [  ] ]") {
              //console.log(response.poligons[i].id);
              //console.log(JSON.parse(latlngs));
              let polygon = L.polygon(JSON.parse(latlngs));
              polygon.properties = {
                'body': response.poligons[i].body,
                'header': response.poligons[i].header.replace('href=\"', 'href=\"'+'http://map.visitcrimea.guide'),
                'hintheader': response.poligons[i].hintHeader,
                'color': response.poligons[i].color
               };
              layer.addLayer(polygon);
              clusterLayer.addLayer(polygon);
            }
          }

          thisReference.set('_beachLayer', layer);
          //Ember.set(beachesLayer, '_beachLayer', layer);
          console.log(layer);
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
    var bounds = new Terraformer.Primitive(e.polygonLayer.toGeoJSON());

    let groupLayer = this.get('_beachLayer');
    //console.log("grouplayer: "+ groupLayer);

    return new Ember.RSVP.Promise((resolve, reject) => {
      let features = Ember.A();
      groupLayer.eachLayer(function(layer) {
        let geoLayer = layer.toGeoJSON();
        let primitive = new Terraformer.Primitive(geoLayer.geometry);
        let l = L.geoJSON(geoLayer);
        geoLayer.properties = layer.properties;

        if (primitive instanceof Terraformer.Point? primitive.within(bounds): (primitive.intersects(bounds) || primitive.within(bounds))) {
          geoLayer.leafletLayer = l;
          features.pushObject(geoLayer);
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
    // TODO
  }
});
