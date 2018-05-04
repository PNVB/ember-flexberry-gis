import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import I18nService from 'ember-i18n/services/i18n';
import I18nRuLocale from 'ember-flexberry-gis/locales/ru/translations';
import I18nEnLocale from 'ember-flexberry-gis/locales/en/translations';

moduleForComponent('layers-dialogs/group/tab/legend-settings', 'Integration | Component | layers dialogs/group/tab/legend settings', {
  beforeEach: function (assert) {
    this.register('locale:ru/translations', I18nRuLocale);
    this.register('locale:en/translations', I18nEnLocale);
    this.register('service:i18n', I18nService);

    this.inject.service('i18n', { as: 'i18n' });
    Ember.Component.reopen({
      i18n: Ember.inject.service('i18n')
    });

    this.set('i18n.locale', 'ru');

    let obj = {
      settings: {
        displaySettings: {
          legendCanBeDisplayed: true
        }
      }
    };
    this.set('_layer', obj);
  },
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{layers-dialogs/group/tab/legend-settings
                    value=_layer.settings.legendSettings
                    type=_layer.type
                  }}`);

  assert.equal(this.$().text().trim(), '');
});
