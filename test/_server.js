'use strict';

var http = require('http');
var pify = require('pify');
var getPort = require('get-port');
var Promise = require('pinkie-promise');
var host = exports.host = 'localhost';

exports.createServer = function () {
    return getPort().then(function (port) {
        var s = http.createServer(function (req, resp) {
            s.emit(req.url, req, resp);
        });

        s.host = host;
        s.port = port;
        s.url = 'http://' + host + ':' + port;
        s.protocol = 'http';

        s.listen = pify(s.listen, Promise);
        s.close = pify(s.close, Promise);

        return s;
    });
};
