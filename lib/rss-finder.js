'use strict';

const request = require('request');
const extend = require('extend');
const htmlParser = require('./parser');
const Promise = require('promise');
const url = require('url');

const defaults = {};

function isRelativeUrl(str) {
    return /^https?:\/\//i.test(str);
}

function setError(str) {
    return new Error(str);
}

function getRequest(uri) {
    return new Promise((resolve, reject) => {
        request(uri, (err, res, body) => {
            if (err) {
                reject(setError(err));
                return;
            }

            if (res.statusCode === 200) {
                resolve(body);
            } else {
                reject();
            }
        });
    });
}

function fixData(res, uri) {
    return new Promise((resolve) => {
        if (res.feedUrls) {
            for (let i = 0, l = res.feedUrls.length; i < l; i++) {
                const feedUrl = res.feedUrls[i];

                if (feedUrl.url && !isRelativeUrl(feedUrl.url)) {
                    feedUrl.url = url.resolve(uri, feedUrl.url);
                }
            }
        }

        res.site.url = uri[uri.length - 1] === '/' ? uri.substr(0, uri.length - 1) : uri;

        if (res.site.favicon) {
            if (!isRelativeUrl(res.site.favicon)) {
                res.site.favicon = url.resolve(uri, res.site.favicon);
            }
        } else {
            const favicon = url.resolve(uri, 'favicon.ico');

            getRequest(favicon).then(() => {
                res.site.favicon = favicon;
                resolve(res);
            }).catch(() => {
                resolve(res);
            });
        }
    });
}

function rssFinder(opts) {
    return new Promise((resolve, reject) => {
        let o = defaults;

        if (typeof opts === 'string') {
            o.url = opts;
        } else if (typeof opts === 'object' && !Array.isArray(opts)) {
            o = extend(true, {}, defaults, opts);
        } else {
            reject(setError('Parameter `opts` must be a string or object.'));
        }

        if (!isRelativeUrl(o.url)) {
            reject(setError('Not HTTP URL is provided.'));
        }

        getRequest(o.url).then((body) => {
            return htmlParser(body);
        }).then((res) => {
            return fixData(res, o.url);
        }).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(setError(err));
        });
    });
}

module.exports = rssFinder;
