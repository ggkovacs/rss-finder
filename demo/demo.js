'use strict';

const rssFinder = require('../index');

const url = 'https://fopekfoepfkoepw.ewfkewo';

rssFinder(url).then((res) => {
    console.log('---------------------------------------------');
    console.log(res);
    console.log('---------------------------------------------');
}).catch((err) => {
    console.log(err);
});
