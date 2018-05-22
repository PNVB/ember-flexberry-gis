/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';

/**
  Gradient styles load and renderer service.

  @class GradientStylesLoadRendererService
  @extends Ember.Service
*/
export default Ember.Service.extend({
  /**
    Inner hash containing settings gradient object.

    @property gradientList
    @type Object[]
    @default []
  */
  gradientList: [
    {
      'name': 'grad1',
      'colorStart': '#ff0000',
      'colorEnd': '#ffff00'
    },
    {
      'name': 'grad2',
      'colorStart': '#000000',
      'colorEnd': '#ffffff'
    },
    {
      'name': 'grad3',
      'colorStart': '#00ff00',
      'colorEnd': '#0000ff'
    },
    {
      'name': 'grad4',
      'colorStart': '#6464c8',
      'colorEnd': '#ff9616'
    },
    {
      'name': 'grad5',
      'colorStart': '#8e707d',
      'colorEnd': '#b992e0'
    }
  ],

  /**
    Returns collection of object gradien list.

    @method getGradientList
    @returns Object[] collection
  */
  getGradientList() {
    return this.get('gradientList');
  }
});
