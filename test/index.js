var util = require('util');
var filter = require('../');

var user = {
  username: 'Oli'
  , password: 'secret password'
  , friends: [
    { username: 'bob', password: 'bob pass' }
    , { username: 'joe', password: 'joe pass' }
    , { username: 'jeff', password: 'jeff pass' }
  ]
  , name: {
    first: 'Olivier'
    , last: 'Lalonde'
  }
}

console.dir(filter(user, { only: 'friends username name.first', except: '.password' }));
console.log(filter(user, 'username friends -friends[:2]'));
