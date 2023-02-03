'use strict';

var rssFinder = require('../index');
const link =
  process.argv.length > 2 ? process.argv[2] : 'http://www.nytimes.com';
console.log('link:', link);
rssFinder(link)
  .then(function(res) {
    console.log(res);
  })
  .catch(function(err) {
    console.log(err);
  });
