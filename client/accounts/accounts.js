
var accountsSub = Meteor.subscribe('allUsers');

Template.accounts.helpers({

  accounts: function () {

    return _.filter(
      _.map( Meteor.users.find().fetch(), function (user) {

        if (user.emails && user.emails[0]) {
          return {
            userId: user._id,
            email: user.emails[0].address,
            author: Roles.userIsInRole(user, 'mdblog-author')
          }
        }
        else return null;
      }),
      function (user) { return (user) }
    );
  }
})

Template.accounts.events({

  'click #mdblog-new': function () {

    Router.go('/sign-up');
  }
});
