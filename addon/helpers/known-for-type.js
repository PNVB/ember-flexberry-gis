import Ember from 'ember';

export function knownForType(params/*, hash*/) {
  let [layer, type] = params;

  return Ember.getOwner(this).knownForType(layer, this.get(type));
}

export default Ember.Helper.helper(knownForType);
