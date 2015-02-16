
function getCredentials (template) {

  var email = template.find('#accounts-email')
    .value.replace(/^\s*|\s*$/g, "");

  var password = template.find('#accounts-password').value;

  return { email: email, password: password };
};

function accountsError(template, key) {

  console.debug(key, TAPi18n.__(key));
  template.find('#accounts-error').innerHTML = '<p>' + TAPi18n.__(key) + '</p>';
};

Template.login.events({

  'submit .accounts-form': function(event, template) {

    console.log("Login...");

    event.preventDefault();
    var cred = getCredentials(template);

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

  'submit .accounts-form': function(event, template) {

    console.log("Registering...");

    event.preventDefault();
    var cred = getCredentials(template);
    var password2 = template.find('#accounts-password2').value;
    if (cred.password === password2) {

      Accounts.createUser(cred, function (err) {

        if (err) {
          if (err.reason.toString() === 'Email already exists.') {
            console.error('Email already exists:', err);
            accountsError(template, 'register_email_exists');
          } else {
            console.error(err);
            accountsError(template, 'register_error');
          }
        }
        else {
          console.info("Registration successful for:", cred.email);
          Router.go('/blog');
        }
      });
    }
    else {
      console.error('Passwords don\'t match');
      accountsError(template, 'passwords_dont_match');
    }
    return false;
  }
});
