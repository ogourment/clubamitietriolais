Meteor.startup(function () {

  // compile the email templates for the blog's locale
  var locale = Meteor.settings.public.blog.defaultLocale;

  SSR.compileTemplate('newUser',
    Assets.getText('new_user_' + locale + '.md'));

  SSR.compileTemplate('publishEmail',
    Assets.getText('publish_email_' + locale + '.html'));
});
