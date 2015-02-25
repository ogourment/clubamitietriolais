
function getCredentials (template) {

  var email = template.find('#account-email')
    .value.replace(/^\s*|\s*$/g, "");

  var password = template.find('#account-password').value;

  return { email: email, password: password };
};

function accountError(template, key) {

  console.debug(key, TAPi18n.__(key));
  template.find('#account-message').innerHTML =
    '<p class="blink fadeout">' + TAPi18n.__(key) + '</p>';
};

Template.login.events({

  'submit .account-form': function (event, template) {

    event.preventDefault();
    var cred = getCredentials(template);

    console.log("Signing in:", cred.email);

    Meteor.loginWithPassword(cred.email, cred.password, function (err) {

      if (err) {
        console.error(err);
        accountError(template, 'login_error');
      }
      else {
        console.info("Login successful for:", cred.email);
        Router.go('/blog');
      }
    });

    return false;
  }
});

Template.register.events({

  'submit .account-form': function (event, template) {

    event.preventDefault();
    var cred = getCredentials(template);
    var password2 = template.find('#account-password2').value;
    if (cred.password === password2) {

      console.log("Creator:", Meteor.user().emails[0].address, " creates user:", cred.email);

      cred.isAuthor = template.find('#author').checked;

      Meteor.apply("createUser2", [ cred ], function (error, result) {

        if (error) {
          console.error(error);
          if (error.reason.toString() === 'Email already exists.') {
            console.error('Email already exists:', error);
            accountError(template, 'register_email_exists');
          } else {
            console.error(error);
            accountError(template, 'register_error');
          }
          return false;
        }

        console.info("Registration successful for:", cred.email);
        _.each(['email', 'password', 'password2'], function (field) {
          template.find("#account-" + field).value = '';
        });
        template.find('#account-message').innerHTML =
          '<h3>' + TAPi18n.__('account_created_success', cred.email) + '</h3>';
      });
    }
    else {
      accountError(template, 'passwords_dont_match');
    }
    return false;
  }
});

Template.accountMessageAndEmail.helpers({
  email: function () {
    if (this.emails) {
      return this.emails[0].address;
    }
  }
});

Template.updateUser.helpers({
  author: function () {
    return Roles.userIsInRole(this, 'mdblog-author');
  }
});

Template.updateUser.events({

  'click #delete-user': function (event, template) {

    event.preventDefault();
    if (confirm(TAPi18n.__("confirm_delete_account"))) {
      Meteor.call('deleteUser', this._id);
      Router.go('accounts');
    }
  },
  'submit .account-form': function (event, template) {

    event.preventDefault();
    var email = template.find('#account-email')
      .value.replace(/^\s*|\s*$/g, "");

    console.log("User:", Meteor.user().emails[0].address,
      " updates user:", this.emails[0].address);

    var isAuthor = template.find('#author').checked;

    Meteor.apply("updateUser", [this._id, email, isAuthor],
      function (error, result) {

      if (error) {
        if (error.error === 'Email already exists.') {
          accountError(template, 'register_email_exists');
        } else {
          console.error(error);
          accountError(template, 'update_error');
        }
        return false;
      }

      console.info("User successfully updated:", result);
      template.find('#account-message').innerHTML =
        '<h3>' + TAPi18n.__('account_updated_success') + '</h3>';
    });
  }
});
