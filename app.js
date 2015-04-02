$(function () {
  'use strict';

  function setLogin(data) {
    $('.js-login').hide();
    $('.js-logout').show();
    $('.js-login-dialog').modal('hide');
    $('.js-profile').html(JSON.stringify(data, null, '  '));
    $('.js-profile-container').fadeIn();

    if (data.user && data.user.photos.length) {
      $('img.js-headshot').attr('src', data.user.photos[0].value);
      $('img.js-headshot').show();
    }
  }

  function testLogin() {
    $.getJSON('/account.json').then(function (data) {
      if (!data || !data.user) {
        return;
      }

      setLogin(data);
    });
  }

  function testAccess(token) {
    // TODO get account list
    $.ajax({
      url: "https://lds.io/api/ldsconnect/"
        + 'undefined'
        + "/me"
    , headers: {
        Authorization: 'Bearer ' + token
      }
    , dataType: 'json'
    }).then(function (data) {
      console.info('testAccess response');
      console.log(data);

      if (!data) {
        return;
      }

      localStorage.setItem('token', token);
      setLogin(data);
    });
  }

  $('.js-open-facebook-login').click('body', function () {
    // handling this in the browser instead of on the server
    // means swapping a redirect for an http request,
    // so don't believe an fanatic's fallacy that this is slower.
    window.completeLogin = function (name, href) {
      // name can be used to disambiguate if you have multiple login strategies
      // href will contain 'code', 'token', or an error you may want to display to the user
      if (!/code=/.test(href)) {
        window.alert("Looks like the login failed for " + name + "!");
        return;
      }

      testLogin();
    };

    // Due to security issues surrounding iframes (click-jacking, etc),
    // we currently only support opening a new window for OAuth2.
    // Admitedly, it's a little more visual distracting that the normal double-redirect,
    // but that makes it much more difficult to bring the user back to their present experience
    // so we highly recommend this method.
    // Once the security issues are figured out, we'll support iframes (like facebook)
    window.open('/auth/facebook');
    // alternate method <iframe src="frame.htm" allowtransparency="true">
  });

  // all the comments above apply here as well, of course
  $('.js-open-ldsconnect-login').click('body', function () {
    window.completeLogin = function (name, url) {
      window.completeLogin = null;
      var match;
      var token;

      // login was probably successful if it had a code
      if (/code=/.test(url)) {
        testLogin();
      }
      else if (/access_token=/.test(url)) {
        match = url.match(/(^|\#|\?|\&)access_token=([^\&]+)(\&|$)/);
        if (!match || !match[2]) {
          throw new Error("couldn't find token!");
        }

        token = match[2];
        testAccess(token);
      }
      else {
        window.alert("looks like the login failed");
      }
    };

    // This would be for server-side oauth2
    //window.open('/auth/' + name);

    var myAppDomain = 'http://must-be-a-fake-domain.com';
    //var myAppDomain = 'https://local.ldsconnect.org:8043';
    var myAppId = 'TEST_ID_9e78b54c44a8746a5727c972';
    var requestedScope = 'me';
    var state = Math.random().toString().replace(/^0./, '');

    var url = 'https://lds.io/api/oauth3/authorization_dialog'
      + '?response_type=token'
      // WARNING: never provide a client_secret in a browser, mobile app, or desktop app
      + '&client_id=' + myAppId
      + '&redirect_uri=' + encodeURIComponent(
                             myAppDomain
                           + '/oauth-close.html'
                           + '?shim=/callbacks/ldsconnect.org'
                           + '&provider_uri=ldsconnect.org'
                           )
      + '&scope=' + encodeURIComponent(requestedScope)
        // Note that state comes back in the redirect_uri
      + '&state=' + state
      ;    

    // This is for client-side oauth2
    window.open(url, 'ldsconnect.orgLogin', 'height=720,width=620');
  });

  function init() {
    $('.js-logout').hide();
    $('img.js-headshot').hide();
    $('.js-profile-container').hide();

    var token = localStorage.getItem('token');
    //var expiresAt = localStorage.getItem('tokenExpiresAt');

    if (token) {
      testAccess(token);
    } else {
      testLogin();
    }
  }

  init();
});
