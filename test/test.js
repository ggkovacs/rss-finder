import test from 'ava';
import fs from 'fs';
import rssFinder from '../';
import { createServer } from './_server';

let s;

test.before('setup', async () => {
  s = await createServer();

  function event(file, contentType) {
    return (req, res) => {
      const data = fs.readFileSync(`${__dirname}/${file}`);
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.write(data);
      res.end();
    };
  }

  s.on('/html-with-absolute-favicon', event('data/with-absolute-favicon.html', 'text/html'));
  s.on('/html-with-relative-favicon', event('data/with-relative-favicon.html', 'text/html'));
  s.on('/html/', event('data/index.html', 'text/html'));
  s.on('/rss', event('data/rss.xml', 'text/xml'));
  s.on('/nofavicon', event('data/nofavicon.html', 'text/html'));
  s.on('/nourl', event('data/nourl.xml', 'text/xml'));
  s.on('/link-tag-without-title', event('data/link-tag-without-title.html', 'text/html'));
  s.on('/without-site-title', event('data/without-site-title.html', 'text/html'));

  s.on('/favicon.ico', (req, res) => {
    res.statusCode = 500;
    res.end();
  });

  s.on('/fail', event('./data/fail.xml', 'text/xml'));

  await s.listen(s.port);
});

test('check response from html (with relative favicon)', async (t) => {
  const res = await rssFinder(`${s.url}/html-with-relative-favicon`);
  t.is(res.site.title, 'RSSFinder');
  t.is(res.site.favicon, `${s.url}/favicon.ico`);
  t.is(res.site.url, `${s.url}/html-with-relative-favicon`);
  t.is(res.feedUrls[0].title, 'RSS');
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test('check response from html (with absolute favicon)', async (t) => {
  const res = await rssFinder(`${s.url}/html-with-absolute-favicon`);
  t.is(res.site.title, 'RSSFinder');
  t.is(res.site.favicon, 'http://www.page.test/favicon.ico');
  t.is(res.site.url, `${s.url}/html-with-absolute-favicon`);
  t.is(res.feedUrls[0].title, 'RSS');
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test('check response from html', async (t) => {
  const res = await rssFinder(`${s.url}/html/`);
  t.is(res.site.title, 'RSSFinder');
  t.is(res.site.favicon, `${s.url}/favicon.ico`);
  t.is(res.site.url, `${s.url}/html`);
  t.is(res.feedUrls[0].title, 'RSS');
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test('check response from rss', async (t) => {
  const res = await rssFinder(`${s.url}/rss`);
  t.is(res.site.title, 'NYT > Home Page');
  t.is(res.site.favicon, 'http://www.nytimes.com/favicon.ico');
  t.is(res.site.url, 'http://www.nytimes.com/pages/index.html?partner=rss&emc=rss');
  t.is(res.feedUrls[0].title, 'NYT > Home Page');
  t.is(res.feedUrls[0].url, 'http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml');
});

test('check response from html (without favicon)', async (t) => {
  const res = await rssFinder(`${s.url}/nofavicon`);
  t.is(res.site.title, 'RSSFinder');
  t.is(res.site.favicon, null);
  t.is(res.site.url, `${s.url}/nofavicon`);
  t.is(res.feedUrls[0].title, 'RSS');
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test('check response from rss (without feed url)', async (t) => {
  const res = await rssFinder(`${s.url}/nourl`);
  t.is(res.site.title, 'Index - 24óra');
  t.is(res.site.favicon, 'http://index.hu/favicon.ico');
  t.is(res.site.url, 'http://index.hu/24ora/');
  t.is(res.feedUrls[0].title, 'Index - 24óra');
  t.is(res.feedUrls[0].url, `${s.url}/nourl`);
});

test('fail xml', async (t) => {
  try {
    await rssFinder(`${s.url}/fail`);
    t.fail('Exception was not thrown');
  } catch (err) {
    t.is(err.message, 'Not a feed');
  }
});

test('not http url is provided', async (t) => {
  try {
    await rssFinder('');
    t.fail('Exception was not thrown');
  } catch (err) {
    t.is(err.message, 'Not HTTP URL is provided.');
  }
});

test('parameter `opts` must be a string or object', async (t) => {
  try {
    await rssFinder([]);
    t.fail('Exception was not thrown');
  } catch (err) {
    t.is(err.message, 'Parameter `opts` must be a string or object.');
  }
});

test('catch errors', async (t) => {
  try {
    await rssFinder({
      url: 'http://url.noexists',
      gotOptions: {
        retries: 0
      }
    });
    t.fail('Exception was not thrown');
  } catch (err) {
    t.regex(err.message, /getaddrinfo ENOTFOUND/);
  }
});

test('link tag without title', async (t) => {
  const res = await rssFinder(`${s.url}/link-tag-without-title`);
  t.is(res.site.title, 'RSSFinder');
  t.is(res.site.favicon, null);
  t.is(res.site.url, `${s.url}/link-tag-without-title`);
  t.is(res.feedUrls[0].title, null);
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test('without-site-title', async (t) => {
  const res = await rssFinder(`${s.url}/without-site-title`);
  t.is(res.site.title, null);
  t.is(res.site.favicon, null);
  t.is(res.site.url, `${s.url}/without-site-title`);
  t.is(res.feedUrls[0].title, 'RSS');
  t.is(res.feedUrls[0].url, `${s.url}/rssfinder.xml`);
});

test.after('cleanup', async () => {
  await s.close();
});
