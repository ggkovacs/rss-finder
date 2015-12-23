'use strict';

var rssFinder = require('../index');

rssFinder('http://times.com').then(function(res) {
    console.log(res);
}).catch(function(err) {
    console.log(err);
});
