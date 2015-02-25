
MeteorSettings.setDefaults({ public:
  {
    pages: {
      "pagesPath": "/pages",
      "manager": { "fixedPages": true }
    }
  }
});

var pagesPath = Meteor.settings.public.pages.pagesPath;

// ***********************************************************************************************
// **** Page

Template.editPage.rendered = function () {
  _handleDragAndDrop();
};

Template.editPage.events({
  'click [contenteditable], focus *[contenteditable]': _edit,
  'keyup [contenteditable]': _update,
  'blur [contenteditable]': _stopEditing
});

Template.editPage.helpers({
  fixedPages: function () {
    return Meteor.settings.public.pages.manager.fixedPages;
  },
  pageReady: function () {
    return this.content;
  },
  content: function () {
    if (this.content) {
      var $content = $('<p/>', {html: marked(this.content)});
      _prettify($content);
      return $content.html();
    }
    return '';
  },
  contenteditable: function () {
    if (UI._globalHelpers.isInRole('mdblog-author')) {
      return 'contenteditable'
    }
    return '';
  }
});

function _update (ev) {
  var $el = $(ev.currentTarget);
  Session.set('mdblog-modified', true);
  if (ev.keyCode == 27) {
    $el.blur();
    return;
  }
  // $('#mdblog-publish').show();
  this[ev.currentTarget.id] = ev.currentTarget.innerText;
  if ($el.data('markdown')) {
    var $content = $('<p/>', {html: marked(this[ev.currentTarget.id])});
    _prettify($content);
    $('#mdblog-clone')[0].innerHTML = $content.html();
  }
}

function _edit (ev) {
  var $el = $(ev.currentTarget);
  if ($el.data('editing')) {
    return;
  }
  if ($el.data('markdown')) {
    var clone = $el.clone();
    $el.after(clone.attr('id', 'mdblog-clone'));
  }
  $el.addClass('editing');
  $el.data('editing', true);
  ev.currentTarget.innerText = this[ev.currentTarget.id];
}

function _stopEditing (ev) {
  var element = ev.currentTarget;
  var $el = $(element);
  $el.data('editing', false);
  $el.removeClass('editing');

  this[element.id] = element.innerText;
  if ($el.data('markdown')) {
    $('#mdblog-clone').remove();
    var $content = $('<p/>', {html: marked(this[ev.currentTarget.id])});
    _prettify($content);
    ev.currentTarget.innerHTML = $content.html();
  }
  // TODO save changes to this.draft.history.time.[field]
}

function _addSyntaxHighlighting (e) {
  var syntaxHighlighting = Meteor.settings.public.blog.prettify['syntax-highlighting'];
  if (syntaxHighlighting) {
    e.find('pre').each(function (i, block) {
      hljs.highlightBlock(block);
    });
  }
}

function _addClassesToElements (e) {
  var elementClasses = Meteor.settings.public.blog.prettify['element-classes'];
  if (elementClasses) {
    for (var i = 0; i < elementClasses.length; i++) {
      e.find(elementClasses[i].locator).each(function (idx, element) {
        var $elem = $(element);
        $elem.addClass(elementClasses[i].classes.join(' '));
      });
    }
  }
}

function _prettify (content) {
  if (Meteor.settings.public.blog.prettify) {
    _addSyntaxHighlighting(content);
    _addClassesToElements(content);
  }
}

// **** File Upload

function doNothing(ev) {
  ev.stopPropagation();
  ev.preventDefault();
};

function _handleDragAndDrop() {
  var obj = $("article#content");
  obj.on('dragenter', doNothing);
  obj.on('dragover', doNothing);
  obj.on('drop', function (ev) {
    ev.preventDefault();
    var $el = $(ev.currentTarget);
    if ($el.data('editing')) {
      var files = ev.originalEvent.dataTransfer.files;
      _handleFileUpload(files, function(markdown) {
        $("article#content")[0].innerHTML += markdown;
        _update(ev);
      });
    }
    return 0;
  });

  // prevent accidental replacement of current page with dragged image
  $(document).on('dragenter', doNothing);
  $(document).on('dragover', doNothing);
  $(document).on('drop', doNothing);
}

function _handleFileUpload(files, addMarkdown) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    // TODO if .md add it!
    if (file.type.indexOf("image") == 0) {
      console.log('Sending image to server: ' + file.name);
      var reader = new FileReader();
      reader.onload = function(e) {
        Meteor.call('upsertImage', file.name, file.type, file.size, e.target.result, function (err, imageSlug) {
          if (!err && imageSlug.length > 0) {
            addMarkdown("![" + file.name + "](" + Meteor.settings.public.blog.baseUrl +
              Meteor.settings.public.blog.imagePath + "/" + imageSlug + ")\n");
          }
        });
      }
      reader.readAsDataURL(file);
    }
  }
}


// ***********************************************************************************************
// **** Page Controls

Router.onAfterAction(function () {
  Session.set('mdblog-modified', false);
});

Template.pageControls.helpers({
  fixedPages: function () {
    return Meteor.settings.public.pages.manager.fixedPages;
  },
  modified: function () {
    return Session.get('mdblog-modified');
  }
});

Template.pageControls.events({
  'click #mdblog-save': _save,
  'click #mdblog-delete': _delete
});

function _save () {
  var userIsSure = confirm(TAPi18n.__("confirm_save_published"));
  if (!userIsSure) {
    return;
  }
  console.error('TODO validate that Name does not contain special chars');
  Meteor.call('upsertPage', this, function (err, page) {
    if (!err) {
      Router.go(pagesPath + '/' + page.page + '/edit');
      Session.set('mdblog-modified', false);
    }
  });
}

function _delete () {
  var input = prompt(TAPi18n.__("confirm_delete"));
  if (input === TAPi18n.__("confirm_delete_YES")) {
    Meteor.call('deletePage', this, function (error) {
      if (error) console.error(error);
      Router.go('pageList');
    });
  }
}
