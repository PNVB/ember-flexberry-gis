import { moduleForModel, test } from 'ember-qunit';

moduleForModel('new-platform-flexberry-g-i-s-parameter-metadata', 'Unit | Serializer | new-platform-flexberry-g-i-s-parameter-metadata', {
  // Specify the other units that are required for this test.
  needs: [
    'serializer:new-platform-flexberry-g-i-s-parameter-metadata',
    'transform:file',
    'transform:decimal',

    'model:custom-inflector-rules',
    'model:new-platform-flexberry-g-i-s-layer-link',
    'model:new-platform-flexberry-g-i-s-layer-metadata',
    'model:new-platform-flexberry-g-i-s-link-metadata',
    'model:new-platform-flexberry-g-i-s-link-parameter',
    'model:new-platform-flexberry-g-i-s-map-layer',
    'model:new-platform-flexberry-g-i-s-map-object-setting',
    'model:new-platform-flexberry-g-i-s-map',
    'model:new-platform-flexberry-g-i-s-parameter-metadata'
  ]
});

// Replace this with your real tests.
test('it serializes records', function(assert) {
  let record = this.subject();

  let serializedRecord = record.serialize();

  assert.ok(serializedRecord);
});
