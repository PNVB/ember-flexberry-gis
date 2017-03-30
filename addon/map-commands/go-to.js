/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import BaseMapCommand from './base';

/**
  Go to map-command.
  Moves map to a given geographic point.

  @class GoToMapCommand
  @extends BaseMapCommand
*/
export default BaseMapCommand.extend({
  /**
    Executes map-command.

    @method execute
  */
  _execute(options) {
    this._super(...arguments);

    let point = Ember.get(options, 'point');
    let crs = Ember.get(options, 'crs');
    let xCaption = Ember.get(options, 'xCaption');
    let yCaption = Ember.get(options, 'yCaption');

    let latlng = null;
    latlng = crs.unproject(point);

    let leafletMap = this.get('leafletMap');
    let popupContent = `${xCaption}: ${point.x}; ${yCaption}: ${point.y}`;

    leafletMap.openPopup(popupContent, latlng);
    leafletMap.panTo(latlng);
  }
});
