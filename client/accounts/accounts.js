(function () {

  AccountsTemplates.configureRoute('signUp');
  AccountsTemplates.configureRoute('signIn');

  // Configure *after* TAPi18n is initialized..
  Meteor.startup( function () {
    
    AccountsTemplates.configure({
      // Behaviour
      confirmPassword: true,
      enablePasswordChange: true,
      forbidClientAccountCreation: false,
      overrideLoginErrors: true,
      sendVerificationEmail: false,

      // Appearance
      showAddRemoveServices: false,
      showForgotPasswordLink: true,
      showLabels: true,
      showPlaceholders: true,

      // Client-side Validation
      continuousValidation: false,
      negativeFeedback: false,
      negativeValidation: true,
      positiveValidation: true,
      positiveFeedback: true,
      showValidating: true,

      // Privacy Policy and Terms of Use
      //privacyUrl: 'privacy',
      //termsUrl: 'terms-of-use',

      // Redirects
      homeRoutePath: '/',
      redirectTimeout: 4000,

      // Texts
      texts: {
        button: {
          signUp: TAPi18n.__('register_now')
        },
        socialSignUp: TAPi18n.__('register'),
        socialIcons: {
          "meteor-developer": "fa fa-rocket"
        },
        title: {
          forgotPwd: TAPi18n.__('recover_password')
        }
      }
    });
  });

})();
