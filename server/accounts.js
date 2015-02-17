
Meteor.methods({

  createBlogUser: function(cred) {

    Match.test(cred, { name: String, password: String });

    var loggedInUser = Meteor.user();
    if (!loggedInUser ||
      !Roles.userIsInRole(loggedInUser, ['mdblog-author'])) {
        throw new Meteor.Error(403, "Access denied")
      }

    var userId = Accounts.createUser(cred);

    console.log('userId', userId);

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
  }
});
