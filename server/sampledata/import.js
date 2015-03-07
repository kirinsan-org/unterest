var db = require('../db');
var users = require('./users.json')

return Promise.all(users.map(function(user) {

  return db.user.create(user);
})).then(function() {
  process.exit(0);
}, console.error)
