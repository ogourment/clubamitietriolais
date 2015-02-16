Meteor.startup(function () {

  Session.set('locale', Meteor.settings.public.blog.defaultLocale);
});
