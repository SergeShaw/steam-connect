'use strict';

var SteamConnect = require('steam-connect');
var SC = new SteamConnect({
  cookieStore: 'cookieStore.json',
  username: 'username',
  password: 'password',
  twoFactorSecret: 'twoFactorSecret',
  delay: 1000*60*10,
  log: true,
}).run();