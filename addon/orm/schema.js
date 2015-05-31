import Ember from 'ember';
import { pluralize } from '../utils/inflector';
import Collection from './collection';
import Association from './associations/association';
import Model from './model';

export default function(db) {

  if (!db) {
    throw 'Mirage: A schema requires a db';
  }

  this.db = db;
  this._registry = {};

  this.registerModels = function(hash) {
    var _this = this;

    Object.keys(hash).forEach(function(type) {
      _this.registerModel(type, hash[type]);
    });
  };

  this.registerModel = function(type, typeClass) {
    this._registry[type] = typeClass;
    var collection = pluralize(type);

    if (!this.db[collection]) {
      db.createCollection(collection);
    }

    this[type] = {
      new: this.new.bind(this, type),
      create: this.create.bind(this, type),
      all: this.all.bind(this, type),
      find: this.find.bind(this, type),
      where: this.where.bind(this, type)
    };

    return this;
  };

  this.new = function(type, attrs) {
    return this._instantiateModel(type, attrs);
  };

  this.create = function(type, attrs) {
    var collection = pluralize(type);

    var augmentedAttrs = this.db[collection].insert(attrs);

    return this._instantiateModel(type, augmentedAttrs);
  };

  this.all = function(type) {
    var collection = pluralize(type);
    var records = db[collection]._records;

    return this._hydrate(records, type);
  };

  this.find = function(type, ids) {
    var collection = pluralize(type);
    if (!db[collection]) {
      throw "Mirage: You're trying to find model(s) of type " + type + " but this collection doesn't exist in the database.";
    }

    var records = db[collection].find(ids);

    return this._hydrate(records, type);
  };

  this.where = function(type, query) {
    var collection = pluralize(type);
    if (!db[collection]) {
      throw "Mirage: You're trying to find model(s) of type " + type + " but this collection doesn't exist in the database.";
    }

    var records = db[collection].where(query);

    return this._hydrate(records, type);
  };

  /*
    Private methods
  */
  this._instantiateModel = function(type, attrs) {
    attrs = attrs || {};
    var initAttrs = {};
    var ModelClass = this._registry[type];

    // Get initAttrs
    var initialForeignKeysHash = {};
    Object.keys(ModelClass).forEach(function(key) {
      if (ModelClass[key] instanceof Association) {
        var association = ModelClass[key];
        var hash = association.getInitialValueForForeignKey(key, attrs);

        initialForeignKeysHash = _.assign(initialForeignKeysHash, hash);
      }
    });

    var intermediate = _.assign(attrs, initialForeignKeysHash);

    Object.keys(intermediate)
      .filter(function(attr) {
        return !(ModelClass[attr] instanceof Association); })
      .forEach(function(attr) {
        var initialVal = intermediate[attr] !== undefined ? intermediate[attr] : null;
        initAttrs[attr] = initialVal;
      });

    // Get any unsaved models from attrs
    var unsavedModels = {};
    Object.keys(attrs).forEach(function(attr) {
      if (attrs[attr] instanceof Model) {
        var model = attrs[attr];
        if (!model.id) {
          unsavedModels[attr] = model;
        }
      }
    });


    return new ModelClass(this, type, initAttrs, unsavedModels);
  };

  /*
    Takes a record and returns a model, or an array of records
    and returns a collection.
  */
  this._hydrate = function(records, type) {
    var _this = this;

    if (Ember.isArray(records)) {
      var models = records.map(function(record) {
        return _this._instantiateModel(type, record);
      });

      return new Collection(models);

    } else {
      var record = records;
      return !record ? null : this._instantiateModel(type, record);
    }
  };
}
