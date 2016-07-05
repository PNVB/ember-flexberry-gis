import __ApplicationSerializer from './application';

export default __ApplicationSerializer.extend({
  attrs: {
    hierarchy: { serialize: 'odata-id', deserialize: 'records' }
  },
  /**
  * Field name where object identifier is kept.
  */
  primaryKey: '__PrimaryKey'
});
