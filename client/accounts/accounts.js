
function getCredentials (template) {

  var email = template.find('#accounts-email')
    .value.replace(/^\s*|\s*$/g, "");

  var password = template.find('#accounts-password').value;

  return { email: email, password: password };
};

function accountsError(template, key) {

  console.debug(key, TAPi18n.__(key));
  template.find('#accounts-message').innerHTML =
    '<p class="blink">' + TAPi18n.__(key) + '</p>';
};

Template.login.events({

  'submit .accounts-form': function(event, template) {

    event.preventDefault();
    var cred = getCredentials(template);

    console.log("Signing in:", cred.email);

    Meteor.loginWithPassword(cred.email, cred.password, function (err) {

      if (err) {
        console.error(err);
        accountsError(template, 'login_error');
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

  'submit .accounts-form': function (event, template) {

    event.preventDefault();
    var cred = getCredentials(template);
    var password2 = template.find('#accounts-password2').value;
    if (cred.password === password2) {

      console.log("Creator:", Meteor.user().emails[0].address, " creates user:", cred.email);

      cred.isAuthor = template.find('#author').checked;

      Meteor.apply("createBlogUser", [ cred ], function (error, result) {

        if (error) {
          console.error(error);
          if (error.reason.toString() === 'Email already exists.') {
            console.error('Email already exists:', error);
            accountsError(template, 'register_email_exists');
          } else {
            console.error(error);
            accountsError(template, 'register_error');
          }
          return false;
        }

        console.info("Registration successful for:", cred.email);
        _.each(['email', 'password', 'password2'], function (field) {
          template.find("#accounts-" + field).value = '';
        });
        template.find('#accounts-message').innerHTML =
          '<h3>' + TAPi18n.__('account_created_success', cred.email) + '</h3>';
      });
    }
    else {
      accountsError(template, 'passwords_dont_match');
    }
    return false;
  }
});
