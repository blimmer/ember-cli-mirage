import { capitalize } from 'ember-cli-mirage/utils/inflector';
import Association from './association';

export default Association.extend({

  // The model type that holds/owns this association
  possessor: '',

  // The model type this association refers to
  referent: '',

  /*
    The belongsTo association adds a fk to the possessor of the association
  */
  getForeignKeyArray: function() {
    return [this.possessor, `${this.referent}_id`];
  },

  getForeignKey: function() {
    return `${this.referent}_id`;
  },

  addMethodsToModel: function(model, key, schema) {
    var _this = this;
    var foreignKey = this.getForeignKey();
    model.associationKeys = model.associationKeys.concat([key, foreignKey]);

    Object.defineProperty(model, this.getForeignKey(), {
      /*
        object.parent_id
          - returns the associated parent's id
      */
      get: function() {
        return this.attrs[foreignKey];
      },

      /*
        object.parent_id = (parentId)
          - sets the associated parent (via id)
      */
      set: function(id) {
        if (id && !schema[_this.referent].find(id)) {
          throw "Couldn't find " + _this.referent + " with id = " + id;
        }

        this.attrs[foreignKey] = id;
        return this;
      }
    });

    Object.defineProperty(model, key, {
      /*
        object.parent
          - returns the associated parent
      */
      get: function() {
        var foreignKeyId = this[foreignKey];
        if (foreignKeyId) {
          _this._tempParent = null;
          return schema[_this.referent].find(foreignKeyId);

        } else if (_this._tempParent) {
          return _this._tempParent;
        } else {
          return null;
        }
      },

      /*
        object.parent = (parentModel)
          - sets the associated parent (via model)
      */
      set: function(newModel) {
        if (newModel && newModel.isNew()) {
          this[foreignKey] = null;
          _this._tempParent = newModel;
        } else if (newModel) {
          _this._tempParent = null;
          this[foreignKey] = newModel.id;
        } else {
          _this._tempParent = null;
          this[foreignKey] = null;
        }
      }
    });

    /*
      object.newParent
        - creates a new unsaved associated parent
    */
    model['new' + capitalize(key)] = function(attrs) {
      var parent = schema[key].new(attrs);

      this[key] = parent;

      return parent;
    };

    /*
      object.createParent
        - creates an associated parent, persists directly to db
    */
    model['create' + capitalize(key)] = function(attrs) {
      var parent = schema[key].create(attrs);

      this[foreignKey] = parent.id;

      return parent;
    };
  }

});
