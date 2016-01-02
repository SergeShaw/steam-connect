'use strict';

var request = require('request');
var FileCookieStore = require("tough-cookie-filestore");
var hex2b64 = require('node-bignumber').hex2b64;
var RSA = require('node-bignumber').Key;
var SteamTotp = require('steam-totp');

const USER_AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36";

class SteamConnect {

  constructor(options) {

    if (!options ||
      !options.cookieStore ||
      !options.username ||
      !options.password) {
      console.log('Error: cookieStore, username and password is required options!');
      return;
    }

    this._jar = request.jar(new FileCookieStore(options.cookieStore));
    this.username = options.username;
    this.password = options.password;
    this.delay = options.delay || 1000*60*5;
    this.log = options.log || false;

    var defaults = {
      jar: this._jar,
      "timeout": 50000,
      "headers": {
        "User-Agent": USER_AGENT
      }
    };
    this.request = request.defaults(defaults);
  };

  run() {
    var self = this;
    self.test();
    setInterval(function() {
      self.test();
    }, self.delay);
  };

  login(callback) {

    var self = this;

    self.request.post('https://steamcommunity.com/login/getrsakey/', {
      'form': {
        "username": self.username
      },
    }, function(err, res, body) {

      if(err) {
        callback(err);
        return;
      }

      var json;
      try {
        json = JSON.parse(body);
      } catch(e) {
        callback(e);
        return;
      }

      if (!json.success || !json.publickey_mod || !json.publickey_exp) {
        callback(new Error("Invalid RSA key received"));
        return;
      }

      var key = new RSA();
      key.setPublic(json.publickey_mod, json.publickey_exp);

      var form = {
        'password': hex2b64(key.encrypt(self.password)),
        'username': self.username,
        'twofactorcode': SteamTotp.generateAuthCode(self.twoFactorSecret),
        'emailauth': '',
        'loginfriendlyname': '',
        'captchagid': '',
        'captcha_text': '',
        'emailsteamid': '',
        'rsatimestamp': json.timestamp,
        'remember_login': 'true',
      };

      self.request.post({
        'uri': 'https://steamcommunity.com/login/dologin/',
        "json": true,
        "form": form,
        headers: {
          'Accept':'*/*',
          'Accept-Encoding':'gzip, deflate',
          'Accept-Language':'ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4,ja;q=0.2',
          'Connection':'keep-alive',
          'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
          'Host':'steamcommunity.com',
          'Origin':'https://steamcommunity.com',
          'Referer':'https://steamcommunity.com/login/home/?goto=%2Fmy%2Fjson',
          'User-Agent': USER_AGENT,
          'X-Requested-With':'XMLHttpRequest',
          donotcache: new Date().getTime(),
        }
      }, function(err, res, body) {
        ;
      });
    });
  };

  test() {
    var self = this;

    self.request('http://steamcommunity.com/my/');
    self.request({
      url: 'http://steamcommunity.com/my/',
      followRedirect: false,
    }, function(err, res) {


      if (res.headers.location &&
        res.headers.location.search('//steamcommunity.com/login/checkstoredlogin/') != -1) {

        if (self.log)
          console.log('checkstoredlogin');

        self.request({
          url: res.headers.location,
          followRedirect: false,
        }, function(err, res) {
          self.test();
        });

      } else if (res.headers.location &&
        res.headers.location.search('steamcommunity.com/login/') != -1) {

        if (self.log)
          console.log('login');

        self.login(function(err) {
          if (err) {
            console.log(err);
          }
        });
      } else {
        if (self.log)
          console.log('logged');
      }
    });
  };
}

module.exports = SteamConnect;
