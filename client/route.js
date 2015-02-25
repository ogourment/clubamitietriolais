(function () {

  Router.configure({
    layoutTemplate: 'mainLayout'
  });

  Router.route('/', function () {
    this.redirect('/pages/contact');
  });

})();
