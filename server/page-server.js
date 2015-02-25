
Page._ensureIndex( { page: 1 }, { unique: true } );
Page._ensureIndex( { path: 1 }, { unique: true } );

Meteor.publish('page', function () {
  return Page.find();
});

function _upsertPage (page) {

  check(page, Object);

  page.title = page.title.trim();
  page.path = page.path.trim();

  var id = page._id;
  if (!id) {
    id = new Meteor.Collection.ObjectID()._str;
  } else {
    delete page._id;
  }

  Page.upsert(id, {$set: page});
}

function _removePage (page) {

  check(page, Object);

  Page.remove(page._id);
}

var _authorRoleRequired = function (func) {
  return function(page) {
    if (Roles.userIsInRole(this.userId, ['mdblog-author'])) {
      func(page);
      return page;
    } else {
      throw new Meteor.Error(403, "Not authorized");
    }
  }
}

Meteor.methods({
  'upsertPage': _authorRoleRequired( _upsertPage ),
  'deletePage': _authorRoleRequired( _removePage )
});
