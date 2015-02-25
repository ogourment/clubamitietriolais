
MeteorSettings.setDefaults({ public:
  {
    pages: {
      "pagesPath": "/pages",
      "manager": { "fixedPages": true }
    }
  }
});

var pagesPath = Meteor.settings.public.pages.pagesPath;

Template.header.helpers({
  pagesManager: function () {
    return Meteor.settings.public.pages.manager;
  },
  pages: function () {
    return Page.find( { page: { $exists: true } } );
  },
  href: function (pageName) {
    return pagesPath + "/" + pageName;
  }
});

Template.header.events({
  'click .sign-out' : function() {
    Meteor.logout( function () {
      Router.go('/');
    });
  }
});

Template.onRendered(function () {
  var node = this.firstNode;
  if (node && Meteor.settings.public.debugTemplates) {
    var template = this.view.name;
    $(node).addClass('is-template').attr('data-template', template);
  }
});
