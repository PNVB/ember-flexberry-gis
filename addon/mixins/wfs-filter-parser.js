/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  WFS filter parser mixin.
  Contains methods for parsing WFS filter.

  @class WfsFilterParserMixin
  @uses <a href="http://emberjs.com/api/classes/Ember.Mixin.html">Ember.Mixin</a>
*/
export default Ember.Mixin.create({
  /**
    Get properties names from leaflet layer object.

    @method getLayerProperties
    @param {Object} leafletObject Leaflet layer object
    @returns {Array} Array with properties names
  */
  getLayerProperties(leafletObject) {
    if (Ember.isNone(leafletObject)) {
      return Ember.A();
    }

    let fields = Ember.A();
    let fieldsDescription = Ember.get(leafletObject, 'readFormat.featureType.fields') || {};
    for (let field in fieldsDescription) {
      fields.addObject(field);
    }

    return fields;
  },

  /**
    Parse filter condition expression ('=', '!=', '<', '<=', '>', '>=', 'LIKE', 'ILIKE').

    @method parseFilterConditionExpression
    @param {String} field Field name
    @param {String} condition Condition name
    @param {String} value Field value
    @returns {Object} Filter object
  */
  parseFilterConditionExpression(field, condition, value) {
    let properties = Ember.A([field, value]);
    switch (condition) {
      case '=':
        if (Ember.isBlank(value)) {
          return new L.Filter.IsNull(field);
        }

        return new L.Filter.EQ(...properties, true);
      case '!=':
        if (Ember.isBlank(value)) {
          return new L.Filter.Not(new L.Filter.IsNull(field));
        }

        return new L.Filter.Or(new L.Filter.NotEQ(...properties, true), new L.Filter.IsNull(field));
      case '>':
        return new L.Filter.GT(...properties, true);
      case '<':
        return new L.Filter.LT(...properties, true);
      case '>=':
        return new L.Filter.GEQ(...properties, true);
      case '<=':
        return new L.Filter.LEQ(...properties, true);
      case 'like':
        return new L.Filter.Like(...properties, { matchCase: true });
      case 'ilike':
        return new L.Filter.Like(...properties, { matchCase: false });
    }
  },

  /**
    Parse filter logical expression ('AND', 'OR', 'NOT').

    @method parseFilterLogicalExpression
    @param {String} condition Filter condition
    @param {String} properties Filter properties
    @returns {Object} Filter object
  */
  parseFilterLogicalExpression(condition, properties) {
    switch (condition) {
      case 'and':
        return new L.Filter.And(...properties);
      case 'or':
        return new L.Filter.Or(...properties);
      case 'not':
        return new L.Filter.Not(properties[0]);
    }
  },

  /**
    Parse filter bbox expression.
    ('IN', 'NOT IN').

    @method parseFilterBboxExpression
    @param {String} condition Filter condition
    @param {Object} coords Bbox coordinates
    @param {String} geometryField Layer's geometry field
    @returns {Object} Filter object
  */
  parseFilterBboxExpression(condition, coords, geometryField) {
    let filter = new L.Filter.BBox(
      geometryField,
      L.latLngBounds(L.latLng(coords.minLat, coords.minLng), L.latLng(coords.maxLat, coords.maxLng)),
      L.CRS.EPSG4326
    );
    switch (condition) {
      case 'in':
        return filter;
      case 'not in':
        return new L.Filter.Not(filter);
    }
  },
});
