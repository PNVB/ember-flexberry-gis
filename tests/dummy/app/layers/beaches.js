/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseLayer from 'ember-flexberry-gis/layers/-private/base';

/**
  Class describing tile layer metadata.

  @class BeachesLayer
  @extends BaseLayer
*/
export default BaseLayer.extend({
  /**
    Icon class related to layer type.

    @property iconClass
    @type String
    @default 'image icon'
  */
  iconClass: 'image icon',

  /**
    Permitted operations related to layer type.

    @property operations
    @type String[]
    @default ['edit', 'remove', 'identify', 'search']
  */
  operations: ['edit', 'remove', 'identify', 'search'],

  /**
    Creates new settings object (with settings related to layer-type).

    @method createSettings
    @returns {Object} New settings object (with settings related to layer-type).
  */
  createSettings() {
    let settings = this._super(...arguments);
    Ember.$.extend(true, settings, {
      url: 'http://localhost:3000/db'
    });

    return settings;
  }
});
