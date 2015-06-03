import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/orm/db';
import {module, test} from 'qunit';

var schema, address1, address2;
module('mirage:integration:schema:hasMany finding', {
  beforeEach: function() {
    var db = new Db({
      users: [
        {id: 1, name: 'Link'}
      ],
      addresses: [
        {id: 1, name: '123 Hyrule Way', user_id: 1},
        {id: 2, name: '12 Goron City', user_id: 1}
      ]
    });

    var User = Model.extend({
      addresses: Mirage.hasMany()
    });
    var Address = Model;

    schema = new Schema(db);
    schema.registerModels({
      user: User,
      address: Address
    });

    address1 = schema.address.find(1);
    address2 = schema.address.find(2);
  }
});

// test('the relationship is wired up correctly', function(assert) {
//   var link = schema.user.find(1);

//   assert.deepEqual(link.addresses.length, 2);
//   assert.deepEqual(link.addresses[0], address1);
//   assert.deepEqual(link.addresses[1], address2);
// });
