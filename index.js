/*
 * @todo
 *  - memoize string parsing
 */
var jsonpath = require('JSONPath')
  _ = require('underscore');


// auto prepend annoying $. to first argument
evalpath = function(obj, path, getpath) {
  if (getpath) {
    var paths = jsonpath.eval(obj, '$.' + path, { resultType: 'PATH' });
    paths.forEach(function (path, index) {
      paths[index] = path.substr(1); // strip leading $
    });
    return paths;
  }

  return jsonpath.eval(obj, '$.' + path);
};

/**
 * A path is a [JSONPath](http://goessner.net/articles/JsonPath/)
 *
 * Options:
 * - `only`: string|array - List of whitespace delimited paths (returned object will only contain those paths)
 * - `except`: string|array - List of whitespace delimited paths (returned object will not contain those paths)
 *
 * @param {Object} object to filter
 * @param {Object|String} options Options hash or string of paths prefixed by + or -.
 */
module.exports = function(obj, options) {
  if (typeof options === 'string') {
    options = parseOptions(options);
  }

  if (!(typeof options === 'object'))
    throw new Error('Second argument must be an object or a string.');

  var only = options.only || [];
  var except = options.except || [];

  if (typeof only === 'string') only = only.split(/ +/g);
  if (typeof except === 'string') except = except.split(/ +/g);

  // if only is not set, start with a copy of the original object
  var ret = (only.length > 0) ? {} : _.extend({}, obj);

  only.forEach(function(path) {
    var normalizedPaths = evalpath(obj, path, true);
    var values = evalpath(obj, path);
    normalizedPaths.forEach(function (normalizedPath, index) {
      setPath(ret, normalizedPath, values[index]);
    });
  });
  except.forEach(function(path) {
    var normalizedPaths = evalpath(obj, path, true);
    //console.log(normalizedPaths);
    normalizedPaths.forEach(function (normalizedPath, index) {
      unsetPath(ret, normalizedPath);
    });
  });
  return ret;
}

function setPath (obj, path, value) {
  return modifyPath('set', obj, path, value);
}
function unsetPath (obj, path) {
  return modifyPath('unset', obj, path);
}
function modifyPath(type, obj, path, value) {
  //remove leading [ and trailing ]
  path = path.substr(1, path.length - 2);
  // @todo: tokenize better than this: might bug if we have ['a'][0]['b][b']['et\'c.']
  path = path.split('][');

  var chain = [];
  path.forEach(function(property) {
    // if string, remove trailing/leading '
    if (property.indexOf('\'') !== -1) {
      property = property.substr(1, property.length-2);
    }
    else {
      property = parseInt(property);
    }
    chain.push(property);
  });

  var root = obj;
  while (chain.length > 0) {
    property = chain.shift();
    if (chain.length === 0) {
      if (type === 'unset') {
        delete root[property];
      }
      else
        root[property] = value;
      break;
    }
    if (type === 'set' && root[property] === undefined) {
      root[property] = (typeof property === 'number') ? [] : {};
    }
    root = root[property];
  }
  return obj;
}

// Recursive
function traverse (obj, cb, parent, key) {
  if (obj instanceof Array) {
    obj.forEach(function(child, index) {
      traverse(child, cb, obj, index);
    });
  }
  else if (typeof obj == 'object') {
    for(var key in obj) {
      traverse(obj[key], cb, obj, key);
    }
  }
  cb(obj, parent, key);
}


function parseOptions (str) {
  var only = [], except = [];
  var regex = {
    only: /[^- ][^ ]*/g
    , except: /\-[^ ]+/g
  }
  str.replace(regex.only, function(path) {
    only.push(path); // strip + or -
  });
  str.replace(regex.except, function(path) {
    except.push(path.substr(1)); // strip -
  });
  return {only: only, except: except};
}
