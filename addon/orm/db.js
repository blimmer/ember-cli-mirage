import Ember from 'ember';

var allDigitsRegex = /^\d+$/;

/*
  The db, an identity map.

  Note the public methods return copies of the data,
  so the actual db records cannot be inadvertantly
  modified.
*/
export default function(initialData) {

  this.loadData = function(data) {
    var _this = this;

    Ember.keys(data).forEach(function(collection) {
      _this.createCollection(collection);
      _this.insert(collection, data[collection]);
    });
  };

  this.createCollection = function(collection) {
    var _this = this;

    this[collection] = {
      _records: []
    };

    // Attach the methods to the collection
    // TODO: use prototype?
    ['all', 'insert', 'find', 'where', 'update', 'remove']
      .forEach(function(method) {
        _this[collection][method] = _this[method].bind(_this, collection);
      });

    return this;
  };

  this.createCollections = function() {
    var _this = this;
    var args = Array.prototype.slice.call(arguments);

    args.forEach(function(collection) {
      _this.createCollection(collection);
    });
  };

  this.emptyData = function() {
    var _this = this;
    Object.keys(this).forEach(function(key) {
      if (key === 'loadData' || key === 'emptyData') {
        return;
      }

      _this[key] = {};
    });
  };

  this.addForeignKey = function(collection, name) {

  };

  this.all = function(collection) {
    var records = this[collection]._records;

    return records.map(function(record) {
      return JSON.parse(JSON.stringify(record));
    });
  };

  this.insert = function(collection, data) {
    var copy = data ? JSON.parse(JSON.stringify(data)) : {};
    var records = this[collection]._records;
    var returnData;

    if (!Ember.isArray(copy)) {
      var attrs = copy;
      if (!attrs.id) {
        attrs.id = records.length + 1;
      }

      records.push(attrs);
      returnData = JSON.parse(JSON.stringify(attrs));

    } else {
      returnData = [];
      copy.forEach(function(attrs) {
        if (!attrs.id) {
          attrs.id = records.length + 1;
        }

        records.push(attrs);
        returnData.push(attrs);
        returnData = returnData.map(function(record) {
          return JSON.parse(JSON.stringify(record));
        });
      });
    }

    return returnData;
  };

  this.find = function(collection, ids) {
    if (Ember.isArray(ids)) {
      var records = this._findRecords(collection, ids)
        .filter(function(record) {
          return record !== undefined;
        });

      // Return a copy
      return records.map(function(record) {
        return JSON.parse(JSON.stringify(record));
      });

    } else {
      var record = this._findRecord(collection, ids);
      if (!record) { return null; }
      return JSON.parse(JSON.stringify(record)); // return a copy
    }
  };

  this.where = function(collection, query) {
    var records = this._findRecordsWhere(collection, query);

    return records.map(function(record) {
      return JSON.parse(JSON.stringify(record));
    });
  };

  this.update = function(collection, attrs, target) {
    var records;

    if (typeof target === 'undefined') {
      var changedRecords = [];
      this[collection]._records.forEach(function(record) {
        var oldRecord = _.assign({}, record);

        Object.keys(attrs).forEach(function(attr) {
          record[attr] = attrs[attr];
        });

        if (!_.isEqual(oldRecord, record)) {
          changedRecords.push(record);
        }
      });

      return changedRecords;

    } else if (typeof target === 'number' || typeof target === 'string') {
      var id = target;
      var record = this._findRecord(collection, id);

      Object.keys(attrs).forEach(function(attr) {
        record[attr] = attrs[attr];
      });

      return record;

    } else if (Ember.isArray(target)) {
      var ids = target;
      records = this._findRecords(collection, ids);

      records.forEach(function(record) {
        Object.keys(attrs).forEach(function(attr) {
          record[attr] = attrs[attr];
        });
      });

      return records;

    } else if (typeof target === 'object') {
      var query = target;
      records = this._findRecordsWhere(collection, query);

      records.forEach(function(record) {
        Object.keys(attrs).forEach(function(attr) {
          record[attr] = attrs[attr];
        });
      });

      return records;
    }
  };

  this.remove = function(collection, target) {
    var _collection = this[collection];
    var records;

    if (typeof target === 'undefined') {
      _collection._records = [];

    } else if (typeof target === 'number' || typeof target === 'string') {
      var record = this._findRecord(collection, target);
      var index = _collection._records.indexOf(record);
      _collection._records.splice(index, 1);

    } else if (Ember.isArray(target)) {
      records = this._findRecords(collection, target);
      records.forEach(function(record) {
        var index = _collection._records.indexOf(record);
        _collection._records.splice(index, 1);
      });

    } else if (typeof target === 'object') {
      records = this._findRecordsWhere(collection, target);
      records.forEach(function(record) {
        var index = _collection._records.indexOf(record);
        _collection._records.splice(index, 1);
      });
    }
  };


  /*
    Private methods.

    These return the actual db objects, whereas the public
    API query methods return copies.
  */

  this._findRecord = function(collection, id) {
    // If parses, coerce to integer
    if (typeof id === "string" && allDigitsRegex.test(id)) {
      id = parseInt(id, 10);
    }

    var record = this[collection]._records.filter(function(obj) {
      return obj.id === id;
    })[0];

    return record;
  };

  this._findRecords = function(collection, ids) {
    var _this = this;

    var records = ids.map(function(id) {
      return _this._findRecord(collection, id);
    });

    return records;
  };

  this._findRecordsWhere = function(collection, query) {
    var records = this[collection]._records;

    Object.keys(query).forEach(function(queryKey) {
      records = records.filter(function(record) {
        return record[queryKey] === query[queryKey];
      });
    });

    return records;
  };


  /*
    Constructor
  */
  if (initialData) {
    this.loadData(initialData);
  }

}
