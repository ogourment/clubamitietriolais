
var pagesSub = Meteor.subscribe('page');

MeteorSettings.setDefaults({ public:
  { blog:
    { "pagesPath": "/pages" }
  }
});

var pagesPath = Meteor.settings.public.pages.pagesPath;

var _pageData = function () {
  var page = this.params.page;
  var found = Page.findOne( { page: page } );
  if (found) {
    return found;
  }
}

Router.map( function () {

  this.route('/pages', {
    name: 'pageList',
    layoutTemplate: 'blogListLayout',
    waitOn: function () { return pagesSub; },
    data: function () {
      return Page.find( {}, { sort: { date: -1 } } );
    }
  });

  this.route(pagesPath + '/:page/edit', {
    name: 'editPage',
    /* template: 'page' did not work */
    layoutTemplate: 'pageLayout',
    waitOn: function () { return pagesSub; },
    data: _pageData
  });

  this.route(pagesPath + '/:page', {
    name: 'displayPage',
    /* template: 'page' did not work */
    layoutTemplate: 'pageLayout',
    waitOn: function () { return pagesSub; },
    data: _pageData
  });
});
