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
  });

})();
