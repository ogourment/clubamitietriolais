(function () {

  'use strict';

  MeteorSettings.setDefaults({ public: {
    blog: { defaultLocale: "en" }
  }}, MeteorSettings.REQUIRED);

  Meteor.publish('blog', function () {
    if (Roles.userIsInRole(this.userId, ['mdblog-author'])) {
      return Blog.find();
    } else {
      return Blog.find( { published: true } );
    }
  });

  function _upsertBlogPost (blog) {

    check(blog, Object); // tried with Blog: Error: Match error: Unknown key in field _id

    blog.published = blog.published ? blog.published : false;
    blog.archived = blog.archived ? blog.archived : false;
    blog.title = blog.title.trim();
    blog.slug = _getSlug(blog.title);

    // if no id was provided, this is a new blog entry so we should create an ID here to extract
    // a short ID before this blog is inserted into the DB
    var id = blog._id;
    if (!id) {
      id = new Meteor.Collection.ObjectID()._str;
    } else {
      delete blog._id;
    }
    blog.shortId = id.substring(0, 5);

    Blog.upsert(id, {$set: blog});
  }

  function _dataURItoBlob(dataURI) {
    if (dataURI.split(',')[0].indexOf('base64') < 0) {
      console.log('ERROR: unknown dataURI: ' + dataURI);
      return '';
    }
    var byteString = new Buffer(dataURI.split(',')[1], 'base64').toString('binary')
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return ia;
  }

  function _sendEmail (blog) {

    check(blog, Object); // tried with Blog: Error: Match error: Unknown key in field _id

    var addresses = Meteor.users.find(
      { 'emails.address': { $ne: '' } } ).map(
      function(doc) { return doc.emails[0].address });

    console.info("Sending email for '" + blog.title + "' to "
      + addresses.length + ' recipient(s):', addresses);

    var url = Meteor.settings.public.blog.baseUrl;
    url += Meteor.settings.public.blog.blogPath;
    if (Meteor.settings.public.blog.useUniqueBlogPostsPath) {
      url += '/' + blog.shortId;
    }
    url += '/' + blog.slug;
    console.info("Link to blog post: " + url);

    var sender = Meteor.user().emails[0].address;
    Email.send({
      to: sender,
      bcc: addresses,
      from: sender,
      subject: blog.title,
      html: SSR.render('publishEmail', { summary: blog.summary,
        url: url, read_more: TAPi18n.__('read_more', {},
          Meteor.settings.public.blog.defaultLocale)
        })
    });
  }

  function _removePost (blog) {
    check(blog, Object); // tried with Blog: Error: Match error: Unknown key in field _id
    Blog.remove(blog._id);
  }

  function _upsertImage(imageName, fileType, fileSize, file) {
    var slug = _getSlug(imageName);
    var bytes = _dataURItoBlob(file);
    if (bytes.length === 0) {
      return '';
    }
    console.log('Saving: slug=' + slug + ' size=' + fileSize + ' type=' + fileType);
    Images.update(
      { slug: slug },
      { slug: slug, name: imageName, type: fileType, size: fileSize, bytes: bytes },
      { upsert: true }
    );
    return slug;
  }

  var _authorRoleRequired = function (func) {
    return function(blog) {
      if (Roles.userIsInRole(this.userId, ['mdblog-author'])) {
        func(blog);
        return blog;
      } else {
        throw new Meteor.Error(403, "Not authorized to author blog posts");
      }
    }
  }

  Meteor.methods({
    'upsertBlog': _authorRoleRequired( _upsertBlogPost ),
    'sendEmail': _authorRoleRequired( _sendEmail ),
    'deleteBlog': _authorRoleRequired( _removePost ),
    'mdBlogCount': function () {
      if (Roles.userIsInRole(this.userId, ['mdblog-author'])) {
        return Blog.find().count();
      } else {
        return Blog.find({published: true}).count();
      }
    },
    'upsertImage': function (imageName, fileType, fileSize, file) {

      check(imageName, String);
      check(fileType, String);
      check(fileSize, Match.Integer);
      check(file, Match.Any);

      if (Roles.userIsInRole(this.userId, ['mdblog-author'])) {
        return _upsertImage(imageName, fileType, fileSize, file);
      } else {
        throw new Meteor.Error(403, "Not authorized to upload images");
      }
    }
  });

  function _getSlug (title) {

    var replace = [
      ' ', '#', '%', '"', ':', '/', '?',
      '^', '`', '[', ']', '{', '}', '<', '>',
      ';', '@', '&', '=', '+', '$', '|', ','
    ];

    var slug = title.toLowerCase();
    for (var i = 0; i < replace.length; i++) {
      slug = _replaceAll(replace[i], '-', slug);
    }
    return slug;
  }

  function _replaceAll (find, replace, str) {
    return str.replace(new RegExp('\\' + find, 'g'), replace);
  }


  Meteor.startup(function () {
    if (!!process.env.AUTO_RESET && process.env.NODE_ENV === 'development') {
      Blog.remove({});
      Images.remove({});
    }
    if (Blog.find().count() === 0) {
      var locale = Meteor.settings.public.blog.defaultLocale;
      _upsertBlogPost({
        published: true,
        archived: false,
        title: TAPi18n.__("blog_post_setup_title", null, locale),
        author: TAPi18n.__("blog_post_setup_author", null, locale),
        date: new Date().getTime(),
        summary: TAPi18n.__("blog_post_setup_summary", null, locale),
        content: TAPi18n.__("blog_post_setup_contents", null, locale)
      });
    }
  });

})();
