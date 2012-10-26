# Install 

    npm install jsonselect;

# Usage

## select(obj, options)

Options:

 - `only`: string|array - List of whitespace delimited paths (returned object will only contain those paths)
 - `except`: string|array - List of whitespace delimited paths (returned object will not contain those paths)

Options can also be a string. See examples.

Paths can be (almost) any [JSONPath](http://goessner.net/articles/JsonPath/).

# Examples

```javascript
var select = require('jsonselect');

var a = select(obj, 'username email name.first friends -friends.password');
// equivalent to
var a2 = select(obj, { only: 'username email name.first friends', except: 'friends.password'} );

var b = select(obj, '-password'); // everything except password
// equivalent to
var b2 = select(obj, { except: 'password' });
```

# Using with Mongoose

Coming soon!

# TODO

- better parser for normalized paths
- properly delete array element using splice/concat
