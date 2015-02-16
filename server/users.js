Accounts.onCreateUser(function (options, user) {

  user.roles = ['mdblog-author'];

  if (options.profile)
    user.profile = options.profile;

  // TODO find a way to verify the user does not already exists!

  console.info('Instructions sent to new user: ', user.emails[0].address);
  var locale = Meteor.settings.public.blog.defaultLocale;
  Email.send({
    to: user.emails[0].address,
    from: user.emails[0].address,
    subject: TAPi18n.__('welcome_email_title', {}, locale),
    html: marked(SSR.render('newUser', {}))
  });

  return user;
});
