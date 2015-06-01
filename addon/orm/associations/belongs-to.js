import { singularize, capitalize } from 'ember-cli-mirage/utils/inflector';
import Association from './association';

export default Association.extend({

  toString: function() {
    return 'association:belongs-to';
  },

  getForeignKey: function() {
    return `${this.type}_id`;
  },

  getInitialValueForForeignKey: function(key, initAttrs) {
    var foreignKey = this.getForeignKey(key);
    var hash = {};
    hash[foreignKey] = initAttrs[foreignKey] !== undefined ? initAttrs[foreignKey] : null;

    // Set foreign key if model was passed in
    if (initAttrs[key] && initAttrs[key].id) {
      hash[foreignKey] = initAttrs[key].id;
    }

    return hash;
  },

  defineRelationship: function(model, key, schema, unsavedModels) {
    var _this = this;
    var foreignKey = this.getForeignKey(key);

    Object.defineProperty(model, key, {
      /*
        object.parent
          - added by belongsTo
          - returns the associated parent
      */
      get: function() {
        var foreignKeyId = model[foreignKey];
        if (foreignKeyId) {
          _this._tempParent = null;
          return schema[_this.type].find(foreignKeyId);

        } else if (_this._tempParent) {
          return _this._tempParent;
        } else {
          return null;
        }
      },

      /*
        object.parent = (parentModel)
          - added by belongsTo
          - sets the associated parent (via model)
      */
      set: function(newModel) {
        if (newModel && newModel.isNew()) {
          model[foreignKey] = null;
          _this._tempParent = newModel;
        } else if (newModel) {
          _this._tempParent = null;
          model[foreignKey] = newModel.id;
        } else {
          _this._tempParent = null;
          model[foreignKey] = null;
        }
      }
    });

    // If an unsaved model was passed into init, save a reference to it
    if (unsavedModels && unsavedModels[key] && !unsavedModels[key].id) {
      this._tempParent = unsavedModels[key];
    }

    /*
      object.newParent
        - added by belongsTo
        - creates a new unsaved associated parent
    */
    model['new' + capitalize(key)] = function(attrs) {
      var parent = schema[key].new(attrs);

      model[key] = parent;

      return parent;
    };

    /*
      object.createParent
        - added by belongsTo
        - creates an associated parent, persists directly to db
    */
    model['create' + capitalize(key)] = function(attrs) {
      var parent = schema[key].create(attrs);

      model[foreignKey] = parent.id;

      return parent;
    };
  }

});
