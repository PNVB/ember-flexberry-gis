/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import MeasureMapTool from './measure';

/**
  Measure radius map-tool.

  @class MeasureRadiusMapTool
  @extends MeasureMapTool
*/
export default MeasureMapTool.extend({
  /**
    Enables tool.

    @method _enable
    @private
  */
  _enable() {
    this._super(...arguments);

    let measureTools = this.get('_measureTools');
    if (Ember.isNone(measureTools)) {
      return;
    }

    measureTools.circleBaseTool.startMeasure();
  }
});
