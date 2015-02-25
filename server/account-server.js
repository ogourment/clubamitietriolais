
function _verifyAuthorized (operation, user) {

  var loggedInUser = Meteor.user();

  if (!loggedInUser ||
    !Roles.userIsInRole(loggedInUser, ['mdblog-author'])) {
      console.error('Unauthorized attempt: ' + operation);
      throw new Meteor.Error(403, "Access denied")
  }

  console.info('Request from user:', loggedInUser.emails[0].address,
    'to:', operation, user);
}

Meteor.methods({

  createUser2: function (cred) {

    check( cred, {
      email: String,
      password: String,
      isAuthor: Boolean });

    _verifyAuthorized('create user', cred);

    var userId = Accounts.createUser(cred);

    if (userId) {

      if (cred.isAuthor) {
        Roles.setUserRoles(userId, ['mdblog-author']);
      }

      var user = Meteor.users.findOne({_id: userId});
      console.log("User created:", user);

      console.info('Instructions sent to new user: ', user.emails[0].address);
      var locale = Meteor.settings.public.blog.defaultLocale;
      Email.send({
        to: user.emails[0].address,
        from: user.emails[0].address,
        subject: TAPi18n.__('welcome_email_title', {}, locale),
        html: marked(SSR.render('newUser', {}))
      });
    }
  },

  updateUser: function (userId, email, isAuthor) {

    check( userId, String );
    check( email, String );
    check( isAuthor, Boolean );

    _verifyAuthorized( 'update user',
      { userId: userId, email: email, isAuthor: isAuthor } );

    var user = Meteor.users.findOne( { _id: userId } );

    if (user) {

      if (user.emails[0].address != email) {

        if (Meteor.users.findOne({'emails.address': email})) {
          throw new Meteor.Error('Email already exists.');
        }

        Meteor.users.update( { _id: user._id },
          { $set: { 'emails.0.address': email } },
          function (error, updated) {

            if (error) {
              console.error("Could not change user's email:", email);
              throw new Meteor.Error(error);
            }
            console.log("User email address changed to:", email);
          });
      }

      var author = Roles.userIsInRole(userId, ['mdblog-author']);
      if (author != isAuthor) {
        Roles.setUserRoles(userId, ['mdblog-author']);
        console.log("User granted mdblog-author:", email);
      }
      else {
        Roles.setUserRoles(userId, []);
        console.log("User revoked mdblog-author:", email);
      }

      return email;
    }

    var error = "updateUser: User not found: _id=" + userId;
    console.error(error);
    throw new Meteor.Error(error);
  },

  deleteUser: function (userId) {

    check(userId, String);

    _verifyAuthorized('delete user', userId);

    if (Meteor.users.remove( { _id: userId } )) {
      console.info('Deteted user: ', userId);
    }
  }
});

Meteor.publish('allUsers', function() {

  if (this.userId && Roles.userIsInRole(this.userId, 'mdblog-author')) {
    return Meteor.users.find({}, {emails: 1, roles: 1})
  }
});
