'use strict';

const rssFinder = require('../index');

const url = 'https://fopekfoepfkoepw.ewfkewo';

rssFinder(url).then((res) => {
    console.log('---------------------------------------------');
    console.log(res);
    console.log('---------------------------------------------');
});

const findRss = require('find-rss');

findRss(url, (err, res) => {
    console.log('---------------------------------------------');
    console.log(res);
    console.log('---------------------------------------------');
});
