import { pluralize } from '../utils/inflector';
import extend from '../utils/extend';
import Association from './associations/association';

/*
  The Model class. Notes:

  - We need to pass in type, because models are created with
    .extend and anonymous functions, so you cannot use
    reflection to find the name of the constructor.
*/

/*
  Constructor
*/
var Model = function(schema, type, attrs, unsavedModels) {
  if (!schema) { throw 'Mirage: A model requires a schema'; }
  if (!type) { throw 'Mirage: A model requires a type'; }

  this._schema = schema;
  this.type = type;

  this._discoverAssociations();
  this._setupAttrs(attrs);
  this._setupRelationships(unsavedModels);

  return this;
};

/*
  Create or save the model
*/
Model.prototype.save = function() {
  var collection = pluralize(this.type);

  if (this.isNew()) {
    // Update the attrs with the db response
    this.attrs = this._schema.db[collection].insert(this.attrs);

    // Ensure the id getter/setter is set
    this._definePlainAttribute('id');

    // Update child models who hold a reference?
  } else {
    this._schema.db[collection].update(this.attrs, this.attrs.id);
  }

  return this;
};

/*
  Update the db record.
*/
Model.prototype.update = function(key, val) {
  var _this = this;
  var attrs;
  if (key == null) {return this;}

  if (typeof key === 'object') {
    attrs = key;
  } else {
    (attrs = {})[key] = val;
  }

  Object.keys(attrs).forEach(function(attr) {
    _this[attr] = attrs[attr];
  });

  this.save();

  return this;
};

/*
  Destroy the db record.
*/
Model.prototype.destroy = function() {
  var collection = pluralize(this.type);
  this._schema.db[collection].remove(this.attrs.id);
};

/*
  Is the model new?
*/
Model.prototype.isNew = function() {
  return this.attrs.id === undefined;
};



// Private

/*
  Define getter/setter for a plain attribute
*/
Model.prototype._definePlainAttribute = function(attr) {
  if (this[attr] !== undefined) { return; }

  // Ensure the attribute is on the attrs hash
  if (!this.attrs.hasOwnProperty(attr)) {
    this.attrs[attr] = null;
  }

  // Define the getter/setter
  Object.defineProperty(this, attr, {
    get: function () { return this.attrs[attr]; },
    set: function (val) { this.attrs[attr] = val; return this; },
  });
};

/*
  Copy this model's associations and foreign keys into a registry for later reference,
  since the keys will be overwritten once the associations are set up.
*/
Model.prototype._discoverAssociations = function() {
  var _this = this;

  var associationsMap = {};
  Object.keys(this.constructor)
    .forEach(function(attr) {
      if (_this.constructor[attr] instanceof Association) {
        associationsMap[attr] = _this.constructor[attr];
      }
    });

  this._associations = associationsMap;
};

/*
  model.attrs represents the persistable attributes, i.e. your db
  table fields.
*/
Model.prototype._setupAttrs = function(initAttrs) {
  var _this = this;
  var attrs = initAttrs || {};
  this.attrs = attrs;

  Object.keys(attrs).forEach(function(attr) {
    _this._definePlainAttribute(attr);
  });
};

Model.prototype._setupRelationships = function(unsavedModels) {
  var _this = this;

  Object.keys(this._associations).forEach(function(attr) {
    _this._associations[attr].defineRelationship(_this, attr, _this._schema, unsavedModels);
  });
};

Model.extend = extend.bind(Model, null);

export default Model;
