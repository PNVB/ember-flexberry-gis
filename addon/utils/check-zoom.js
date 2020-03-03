/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

let checkMapZoom = (layer) =>{
  const mapZoom = _getMapZoom(layer._map);
  const minZoom = _getLayerOption(layer, 'minZoom');
  const maxZoom = _getLayerOption(layer, 'maxZoom');
  return Ember.isNone(mapZoom) || Ember.isNone(minZoom) || Ember.isNone(maxZoom) || minZoom <= mapZoom && mapZoom <= maxZoom;
};

let _getMapZoom = (map) => {
  if (!Ember.isNone(map) && map.getZoom) {
    return map.getZoom();
  }

  return null;
};

let _getLayerOption = (layer, propName) => {
  let zoomResult = Ember.get(layer, `${propName}`);
  if (Ember.isNone(zoomResult)) {
    const parentLayers = Ember.get(layer, '_eventParents');
    for (var key in parentLayers) {
      zoomResult = Ember.get(parentLayers, `${key}.${propName}`);
      if (!Ember.isNone(zoomResult)) {
        return zoomResult;
      }
    }
  }

  return zoomResult;
};

export {
  checkMapZoom
};