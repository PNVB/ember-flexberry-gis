/**
  @module ember-flexberry-gis
*/

import Ember from 'ember';
import {
  Model as NewPlatformFlexberyGISMapLayerModelMixin,
  defineProjections
} from '../mixins/regenerated/models/new-platform-flexberry-g-i-s-map-layer';
import { Projection } from 'ember-flexberry-data';
import LeafletCrsMixin from '../mixins/leaflet-crs';

/**
  Map layer model.

  @class NewPlatformFlexberryGISMapLayer
  @extends Model
  @uses NewPlatformFlexberyGISMapLayerModelMixin
  @uses LeafletCrsMixin
*/
let Model = Projection.Model.extend(NewPlatformFlexberyGISMapLayerModelMixin, LeafletCrsMixin, {
  settingsAsObject: Ember.computed('settings', function () {
    let stringToDeserialize = this.get('settings');
    if (!Ember.isBlank(stringToDeserialize)) {
      try {
        return JSON.parse(stringToDeserialize);
      }
      catch (e) {
        console.log('Error on read layer properties on layer ' + this.get('name'), e);
        throw e;
      }
    }

    return {};
  }),

  /**
    Checks whether layer can be identified.

    @property canBeIdentified
    @type {Boolean} Flag: indicates whether layer can be identified.
    @readOnly
  */
  canBeIdentified: Ember.computed('isDeleted', 'type', 'settingsAsObject.identifySettings.canBeIdentified', function () {
    if (this.get('isDeleted')) {
      return false;
    }

    let layerClassFactory = Ember.getOwner(this).knownForType('layer', this.get('type'));
    let identifyOperationIsAvailableForLayerClass = Ember.A(Ember.get(layerClassFactory, 'operations') || []).contains('identify');
    let identifyOperationIsAvailableForLayerInstance = this.get('settingsAsObject.identifySettings.canBeIdentified') !== false;

    return identifyOperationIsAvailableForLayerClass && identifyOperationIsAvailableForLayerInstance;
  }),

  layers: null
});

defineProjections(Model);

export default Model;
