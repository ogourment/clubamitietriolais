(function () {

  Router.configure({
    layoutTemplate: 'mainLayout'
  });

  Router.map(function () {

    this.route('home', {
      path: '/',
      onAfterAction : function() {
        document.title = TAPi18n("name", {},
          Meteor.settings.public.blog.defaultLocale);
      }
    });

    this.route('/sign-in', {
      name: 'login',
      layoutTemplate: 'accounts'
    });
    this.route('/sign-up', {
      name: 'register',
      layoutTemplate: 'accounts'
    });
  });

})();
