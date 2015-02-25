
MeteorSettings.setDefaults({ public:
  {
    pages: {
      "manager": { "fixedPages": true }
    }
  }
});

// ***********************************************************************************************
// **** Page List

Template.pageList.rendered = function () {
  Tracker.autorun(function() {
    Session.get('locale'); // force dependency
    _setMetadata({
      title: TAPi18n.__("name"),
      description: TAPi18n.__("description")
    });
  });
};

var _setMetadata = function (meta) {
  if (meta.title) {
    document.title = meta.title;
    delete meta.title;
  }
  for (var key in meta) {
    $('meta[name="' + key + '"]').remove();
    $('head').append('<meta name="' + key + '" content="' + meta[key] + '">');

    $('meta[property="og:' + key + '"]').remove();
    $('head').append('<meta property="og:' + key + '" content="' + meta[key] + '">');
  }
};

Template.pageList.helpers({
  fixedPages: function () {
    return Meteor.settings.public.pages.manager.fixedPages;
  },
  content: function () {
    return marked(this.summary);
  }
});

Template.pageList.events({
  'click #mdblog-new': _new
});

function _new () {

  if (!Meteor.user()) {
    this.render('not-found');
    return;
  }

  var newPage = {
    title: TAPi18n.__("new_page_title"),
    summary: TAPi18n.__("new_page_summary"),
    page: TAPi18n.__("new_page_name"),
    path: TAPi18n.__("new_page_path"),
    content: TAPi18n.__("new_page_contents")
  };
  Meteor.call('upsertPage', newPage, function(err, page) {
    if (!err) {
      Router.go(pagesPath + '/' + page.page);
    } else {
      console.log('Error upserting page', err);
    }
  });
}
