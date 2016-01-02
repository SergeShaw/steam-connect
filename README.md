# steam-connect
keep your steam online

JavaScript Example
```javascript
var SteamConnect = require('steam-connect');
var SC = new SteamConnect({
  cookieStore: 'cookieStore.json',
  username: 'username',
  password: 'password',
  twoFactorSecret: 'twoFactorSecret',
  delay: 1000*60*10,
  log: true,
}).run();
```
Cookie file format:
```javascript
{
  "steamcommunity.com": {
    "/": {
      "sessionid": {
        "key": "sessionid",
        "value": "628bd234d2252df917071e53",
        "domain": "steamcommunity.com",
        "path": "/",
        "hostOnly": true,
        "creation": "2016-01-02T12:42:12.059Z",
        "lastAccessed": "2016-01-02T17:56:05.866Z"
      }
    }
  }
}
```
