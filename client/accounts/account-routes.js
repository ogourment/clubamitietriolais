
var accountsSub = Meteor.subscribe('allUsers');

Router.map(function () {

  this.route('/accounts', {
    name: 'accounts',
    layoutTemplate: 'pageLayout',
    waitOn: function () { return accountsSub; }
  });
  this.route('/sign-in', {
    name: 'login',
    layoutTemplate: 'account'
  });
  this.route('/sign-up', {
    name: 'register',
    layoutTemplate: 'account'
  });
  this.route('/update-user/:id', {
    name: 'updateUser',
    layoutTemplate: 'account',
    waitOn: function () { return accountsSub; },
    data: function () {
      return Meteor.users.findOne(
        { _id: this.params.id } );
    }
  });
});
