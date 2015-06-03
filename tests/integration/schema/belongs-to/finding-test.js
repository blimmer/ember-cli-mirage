import Mirage from 'ember-cli-mirage';
import Model from 'ember-cli-mirage/orm/model';
import Schema from 'ember-cli-mirage/orm/schema';
import Db from 'ember-cli-mirage/orm/db';
import {module, test} from 'qunit';

var schema, link;
module('mirage:integration:schema:belongsTo finding', {
  beforeEach: function() {
    var db = new Db({
      users: [
        {id: 1, name: 'Link'}
      ],
      addresses: [
        {id: 1, name: '123 Hyrule Way', user_id: 1}
      ]
    });

    var User = Model.extend();
    var Address = Model.extend({
      user: Mirage.belongsTo()
    });

    schema = new Schema(db);
    schema.registerModels({
      user: User,
      address: Address
    });

    link = schema.user.find(1);
  }
});

test('the relationship is wired up correctly', function(assert) {
  var address = schema.address.find(1);

  assert.equal(address.user_id, 1);
  assert.deepEqual(address.user, link);
  // assert.deepEqual(address.attrs, {id: 1, user_id: 1, name: '123 Hyrule Way'});
});

// test('it errors if the record doesnt exist', function(assert) {
// });
