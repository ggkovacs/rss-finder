'use strict';

var htmlparser = require('htmlparser2');
var FeedParser = require('feedparser');
var Promise = require('pinkie-promise');

var rssTypes = [
    'application/rss+xml',
    'application/atom+xml',
    'application/rdf+xml',
    'application/rss',
    'application/atom',
    'application/rdf',
    'text/rss+xml',
    'text/atom+xml',
    'text/rdf+xml',
    'text/rss',
    'text/atom',
    'text/rdf'
];

var iconRels = [
    'icon',
    'shortcut icon'
];

function htmlParser(htmlBody, feedParserOptions) {
    return new Promise(function(resolve, reject) {
        var rs = {};
        var feeds = [];
        var parser;
        var isFeeds;
        var favicon;
        var isSiteTitle;
        var siteTitle;
        var feedParser;

        parser = new htmlparser.Parser({
            onopentag: function(name, attr) {
                if (/(feed)|(atom)|(rdf)|(rss)/.test(name)) {
                    isFeeds = true;
                }

                if (name === 'link' && (rssTypes.indexOf(attr.type) !== -1)) {
                    feeds.push({
                        title: attr.title || null,
                        url: attr.href || null
                    });
                }

                if (name === 'link' && (iconRels.indexOf(attr.rel) !== -1 || attr.type === 'image/x-icon')) {
                    favicon = attr.href;
                }

                if (name === 'title') {
                    isSiteTitle = true;
                }
            },
            ontext: function(text) {
                if (isSiteTitle) {
                    siteTitle = text;
                }
            },
            onclosetag: function(name) {
                if (name === 'title') {
                    isSiteTitle = false;
                }
            }
        }, {
            recognizeCDATA: true
        });

        parser.write(htmlBody);
        parser.end();

        if (isFeeds) {
            feedParser = new FeedParser(feedParserOptions);

            feeds = [];

            feedParser.on('error', function(err) {
                reject(err);
            });

            feedParser.on('readable', function() {
                var data;

                if (feeds.length === 0) {
                    data = this.meta;
                    feeds.push(data);
                }
            });

            feedParser.write(htmlBody);

            feedParser.end(function() {
                if (feeds.length !== 0) {
                    rs.site = {
                        title: feeds[0].title || null,
                        favicon: feeds[0].favicon || null,
                        url: feeds[0].link || null
                    };

                    rs.feedUrls = [{
                        title: feeds[0].title || null,
                        url: feeds[0].xmlUrl || null
                    }];
                }

                resolve(rs);
            });
        } else {
            rs.site = {
                title: siteTitle || null,
                favicon: favicon || null
            };

            rs.feedUrls = feeds;

            resolve(rs);
        }
    });
}

module.exports = htmlParser;
