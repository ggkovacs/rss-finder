'use strict';

var htmlParser = require('./parser');
var extend = require('extend');
var Promise = require('pinkie-promise');
var url = require('url');
var got = require('got');

var defaults = {
    gotOptions: {},
    feedParserOptions: {}
};

function isRelativeUrl(str) {
    return /^https?:\/\//i.test(str);
}

function setError(err) {
    if (err instanceof Error) {
        return err;
    }

    return new Error(err);
}

function cleanUrl(uri) {
    if (uri[uri.length - 1] === '/') {
        return uri.substr(0, uri.length - 1);
    }

    return uri;
}

function getFaviconUrl(uri) {
    var parsedUrl = url.parse(uri);

    return url.resolve(parsedUrl.protocol + '//' + parsedUrl.host, 'favicon.ico');
}

function fixData(res, uri) {
    return new Promise(function(resolve) {
        var feedUrl;
        var favicon;
        var i = res.feedUrls.length;

        while (i--) {
            feedUrl = res.feedUrls[i];

            if (feedUrl.url) {
                if (!isRelativeUrl(feedUrl.url)) {
                    feedUrl.url = url.resolve(uri, feedUrl.url);
                }
            } else {
                feedUrl.url = uri;
            }
        }

        if (!res.site.url) {
            res.site.url = cleanUrl(uri);
        }

        if (res.site.favicon) {
            if (!isRelativeUrl(res.site.favicon)) {
                res.site.favicon = url.resolve(res.site.url, res.site.favicon);
            }

            resolve(res);
        } else {
            favicon = getFaviconUrl(res.site.url);

            got(favicon, {
                retries: 0
            }).then(function() {
                res.site.favicon = favicon;
                resolve(res);
            }).catch(function() {
                resolve(res);
            });
        }
    });
}

function rssFinder(opts) {
    return new Promise(function(resolve, reject) {
        var o = extend(true, {}, defaults);

        if (typeof opts === 'string') {
            o.url = opts;
        } else if (typeof opts === 'object' && !Array.isArray(opts)) {
            o = extend(true, {}, defaults, opts);
        } else {
            reject(setError('Parameter `opts` must be a string or object.'));
            return;
        }

        if (!isRelativeUrl(o.url)) {
            reject(setError('Not HTTP URL is provided.'));
            return;
        }

        var canonicalUrl;

        got(o.url, o.gotOptions)
            .then(function(res) {
                canonicalUrl = res.url;
                return htmlParser(res.body, o.feedParserOptions);
            })
            .then(function(res) {
                return fixData(res, canonicalUrl);
            })
            .then(function(res) {
                resolve(res);
            })
            .catch(function(err) {
                reject(setError(err));
            });
    });
}

module.exports = rssFinder;
