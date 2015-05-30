import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/orm/db';
import {module, test} from 'qunit';

var schema, child1, child2;
module('mirage:integration:schema:hasMany instantiating with params', {
  beforeEach: function() {
    var db = new Db({
      users: [],
      addresses: [
        {id: 1, name: '123 Hyrule Way'},
        {id: 2, name: '12 Goron City'},
      ]
    });
    schema = new Schema(db);

    var User = Model.extend({
      addresses: Mirage.hasMany()
    });
    var Address = Model.extend();

    schema.registerModel('user', User);
    schema.registerModel('address', Address);

    child1 = schema.address.find(1);
    child2 = schema.address.find(2);
  }
});

// test('the parent accepts an array of saved children ids', function(assert) {
//   var user = schema.user.new({address_ids: [1, 2]});

//   assert.equal(user.addresses, [child1, child2]);
//   assert.equal(user.address_ids, [1, 2]);
// });
