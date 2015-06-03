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
    return [this.referent, `${this.possessor}_id`];
  },

  getForeignKey: function() {
    return `${this.possessor}_id`;
  },

  addMethodsToModel: function(model, key, schema) {
    var association = this;
    var foreignKey = this.getForeignKey();
    var relationshipIdsKey = association.referent + '_ids';

    model.associationKeys = model.associationKeys.concat([key, relationshipIdsKey]);

    Object.defineProperty(model, relationshipIdsKey, {
    //   /*
    //     object.children_ids
    //       - returns an array of the associated children's ids
    //   */
      get: function() {
        if (this.isNew()) {
          return association._tempChildren.map(function(child) {return child.id;});
        } else {

        }
        // debugger;

        // return this[key].map(function(child) { return child.id; });
        // debugger;
    //     return this.attrs[foreignKey];
      },

      /*
        object.children_ids = ([childrenIds...])
          - sets the associated parent (via id)
      */
      set: function(ids) {
        if (this.isNew()) {
          association._tempChildren = schema[association.referent].find(ids);

        } else {
          // var col = schema[association.referent].find(ids);
          // col.update(foreignKey, this.id);
        }
        // debugger;
        return this;
        // if (id && !schema[_this.referent].find(id)) {
        //   throw "Couldn't find " + _this.referent + " with id = " + id;
        // }

        // this.attrs[foreignKey] = id;
        // return this;
      }
    });

    Object.defineProperty(model, key, {
      /*
        object.children
          - returns an array of associated children
      */
      get: function() {
        if (this.isNew()) {
          return association._tempChildren;

        } else {
          var query = {};
          query[foreignKey] = this.id;

          return schema[association.referent].where(query);
        }

        // var foreignKeyId = this[foreignKey];
        // if (foreignKeyId) {
        //   _this._tempParent = null;
        //   return schema[_this.referent].find(foreignKeyId);

        // } else if (_this._tempParent) {
        //   return _this._tempParent;
        // } else {
        //   return null;
        // }
      },

    //   /*
    //     object.parent = (parentModel)
    //       - sets the associated parent (via model)
    //   */
    //   set: function(newModel) {
    //     if (newModel && newModel.isNew()) {
    //       this[foreignKey] = null;
    //       _this._tempParent = newModel;
    //     } else if (newModel) {
    //       _this._tempParent = null;
    //       this[foreignKey] = newModel.id;
    //     } else {
    //       _this._tempParent = null;
    //       this[foreignKey] = null;
    //     }
    //   }
    });

    // /*
    //   object.newParent
    //     - creates a new unsaved associated parent
    // */
    // model['new' + capitalize(key)] = function(attrs) {
    //   var parent = schema[key].new(attrs);

    //   this[key] = parent;

    //   return parent;
    // };

    // /*
    //   object.createParent
    //     - creates an associated parent, persists directly to db
    // */
    // model['create' + capitalize(key)] = function(attrs) {
    //   var parent = schema[key].create(attrs);

    //   this[foreignKey] = parent.id;

    //   return parent;
    // };
  }

});
