'use strict';

const htmlparser = require('htmlparser2');
const FeedParser = require('feedparser');
const Promise = require('promise');

const rssTypes = [
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

const iconRels = [
    'icon',
    'shortcut icon'
];

function htmlParser(htmlBody) {
    return new Promise((resolve, reject) => {
        const rs = {};
        let feeds = [];
        let parser;
        let isFeeds;
        let favicon;
        let isSiteTitle;
        let siteTitle;

        parser = new htmlparser.Parser({
            onopentag: (name, attr) => {
                if (/(feed)|(atom)|(rdf)|(rss)/.test(name)) {
                    isFeeds = true;
                }

                if (name === 'link' && (rssTypes.indexOf(attr.type) !== -1)) {
                    feeds.push({
                        title: attr.title,
                        url: attr.href
                    });
                }

                if (name === 'link' && (iconRels.indexOf(attr.rel) !== -1 || attr.type === 'image/x-icon')) {
                    favicon = attr.href;
                }

                if (name === 'title') {
                    isSiteTitle = true;
                    return isSiteTitle;
                }
            },
            ontext: (text) => {
                if (isSiteTitle) {
                    siteTitle = text;
                    return siteTitle;
                }
            },
            onclosetag: (name) => {
                if (name === 'title') {
                    isSiteTitle = false;
                    return isSiteTitle;
                }
            }
        }, {
            recognizeCDATA: true
        });

        parser.write(htmlBody);
        parser.end();

        if (isFeeds) {
            const feedParser = new FeedParser();

            feeds = [];

            feedParser.on('error', (err) => {
                reject(err);
                return;
            });

            feedParser.on('readable', function readable() {
                let data;

                if (feeds.length === 0) {
                    data = this.meta;
                    return feeds.push(data);
                }
            });

            feedParser.write(htmlBody);

            return feedParser.end(function end() {
                resolve(feeds);
                return;
            });
        }

        if (siteTitle) {
            rs.site = {
                title: siteTitle
            };
        }

        if (favicon) {
            if (!rs.site) {
                rs.site = {};
            }

            rs.site.favicon = favicon;
        }

        if (feeds.length > 0) {
            rs.feedUrls = feeds;
        }

        resolve(rs);
    });
}

module.exports = htmlParser;
