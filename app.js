$(function () {
  'use strict';

  var Oauth3 = window.OAUTH3;

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

  function testLdsAccess(token) {
    // TODO get account list
    $.ajax({
      url: "https://lds.io/api/ldsio/accounts"
    , headers: {
        Authorization: 'Bearer ' + token
      }
    , dataType: 'json'
    }).then(function (data) {
      console.info('testLdsAccess response');
      console.log(data);

      if (!data) {
        return;
      }

      localStorage.setItem('token', token);
      setLogin(data);
    });
  }

  $('.js-open-facebook-login').click('body', function () {
    Oauth3.login('https://facebook.com', {
      type: 'popup'
    , authorizationRedirect: true
    , appId: ''
    }).then(function (params) {
      console.log('works', params);
      //testFacebookAccess(params.access_token);
    }, function (err) {
      console.log('breaks');
      console.error(err);
    });
  });

  // all the comments above apply here as well, of course
  $('.js-open-ldsconnect-login').click('body', function () {
    Oauth3.login('https://ldsconnect.org', {
      type: 'popup'
    , authorizationRedirect: true
    , appId: 'TEST_ID_beba4219ee9e9edac8a75237'
      // For Firefox OS (FxOS)
    , redirectUri: 'http://must-be-a-fake-domain.com'
    , scope: ''
    }).then(function (params) {
      console.log('works');
      testLdsAccess(params.access_token);
    }, function (err) {
      console.log('breaks');
      console.error(err);
    });
  });

  function init() {
    $('.js-logout').hide();
    $('img.js-headshot').hide();
    $('.js-profile-container').hide();

    var token = localStorage.getItem('token');
    //var expiresAt = localStorage.getItem('tokenExpiresAt');

    if (token) {
      testLdsAccess(token);
    } else {
      testLogin();
    }
  }

  init();
});
