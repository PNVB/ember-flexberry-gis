/**
  @module ember-flexberry-gis
*/

import IdentifyMapTool from './identify-rectangle';
import IdentifyAllMixin from '../mixins/map-tools/identify-all';

/**
  Identify map-tool that identifies all map layers.

  @class IdentifyAllRectangleMapTool
  @extends IdentifyMapTool
*/
export default IdentifyMapTool.extend(IdentifyAllMixin, {
});
