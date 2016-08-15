
var lodash = require('lodash')

var object = { 'a': 1 };
var other = { 'a': 1 , "b" : 2 };

var res = lodash.isEqual(object, other);
console.log(res)