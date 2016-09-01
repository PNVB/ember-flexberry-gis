import MapTool from 'ember-flexberry-gis/maptools/maptool';

export default MapTool.extend({
  enable() {
    this._super(...arguments);
    let map = this.get('map');
    map.dragging.enable();
  },

  disable() {
    this._super(...arguments);
    let map = this.get('map');
    map.dragging.disable();
  }
});