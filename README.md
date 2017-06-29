# RSS Finder [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage Status][coverage-image]][coverage-url]
Version: **2.0.4**

## Installation

Run `npm install rss-finder`

## Usage

```js
'use strict';

var rssFinder = require('rss-finder');

rssFinder('http://www.nytimes.com').then(function(res) {
    console.log(res);
}).catch(function(err) {
    console.log(err);
});

// or

rssFinder({
    url: 'http://www.nytimes.com'
}).then(function(res) {
    console.log(res);
}).catch(function(err) {
    console.log(err);
});
```

### Response
```js
{
    site: {
        title: 'The New York Times - Breaking News, World News & Multimedia',
        favicon: 'http://static01.nyt.com/favicon.ico',
        url: 'http://www.nytimes.com'
    },
    feedUrls:[{
        title: 'RSS',
        url: 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml'
    }]
}
```

## API

### rssFinder(options)

#### options
Type: `String` | `Object`

##### url
Type: `String`

##### gotOptions

This object is passed to [`got` options](https://github.com/sindresorhus/got#api) directly (refer to [`got` documentation](https://github.com/sindresorhus/got)).

##### feedParserOptions

This object is passed to [`feedparser` options](https://github.com/danmactough/node-feedparser#options) directly (refer to [`feedparser` documentation](https://github.com/danmactough/node-feedparser)).


# License
MIT © 2017 Gergely Kovács (gg.kovacs@gmail.com)

[npm-image]: https://badge.fury.io/js/rss-finder.svg
[npm-url]: https://npmjs.org/package/rss-finder
[travis-image]: https://travis-ci.org/ggkovacs/rss-finder.svg?branch=master
[travis-url]: https://travis-ci.org/ggkovacs/rss-finder
[daviddm-image]: https://david-dm.org/ggkovacs/rss-finder.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ggkovacs/rss-finder
[coverage-image]: https://coveralls.io/repos/ggkovacs/rss-finder/badge.svg?service=github&branch=master
[coverage-url]: https://coveralls.io/github/ggkovacs/rss-finder?branch=master
