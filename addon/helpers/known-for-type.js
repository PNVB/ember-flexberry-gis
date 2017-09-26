import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params/*, hash*/) {
    let [layer, type] = params;

    return Ember.getOwner(this).knownForType(layer, type);
  }
});
