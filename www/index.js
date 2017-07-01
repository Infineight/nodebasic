const fs = require('fs');
const https = require('https');
const util = require('util');
var common = require('./common.js');
var pug = require('pug');

const options = {
	key: fs.readFileSync('/etc/ssl/private/key.pem'),
	cert: fs.readFileSync('/etc/ssl/certs/cert.pem')
};

https.createServer(options, function (request, response) {

	var headers = {
		"Content-Type": "text/html; charset=utf-8"
	};

	var url_parts = request.url.substr(1).split('/');
	switch(url_parts.length) {

		default:
		// home page
		case 0: {
			console.log('home');
			var filename = url_parts[0]+'.js';
			var index = safe_require('./modules/index.js');
			if(index != null) {
				common.start(response);
				response.end(index.output());
			} else {
				common.exit(response, 500);
			}
			break;
		}
		// module include
		case 1: {
			var filename = url_parts[0]+'.js';
			var index = safe_require('./modules/index.js');
			if(index != null) {
				common.start(response);
				response.end(index.output());
			} else {
				common.exit(response, 500);
			}
			break;
		}
		// css/js include
		case 2: {
			if(url_parts[0] == 'css' || url_parts[0] == 'js') {
				switch(url_parts[0]) {
					case 'css': {
						headers["Content-Type"] = "text/css";
						break;
					}
					case 'js': {
						headers["Content-Type"] = "text/javascript";
						break;
					}
				}
				var filename = url_parts[0]+'/'+url_parts[1]+'.'+url_parts[0];
				fs.open(filename, 'r', function(err, fd) {
					if (err) {
						common.exit(response, 404);
						if (err.code === "ENOENT") {
							console.error(filename+' does not exist');
							return;
						} else {
							throw err;
						}
					} else {
						fs.stat(filename, function(err, stat) {
							if(err) {
								common.exit(response, 404);
							} else {
								common.start(response);
								var buffer = new Buffer(stat.size);
								fs.read(fd, buffer, 0, buffer.length, null, function(err, bytesRead, buffer) {
									response.end(buffer.toString("utf8", 0, buffer.length));
								});
							}
						});
					}
				});
			}
			break;
		}

	}

}).listen(443);

const http = require('http');
http.createServer(function (request, response) {
	response.writeHead(301, {
		'Location': 'https://'+request.headers.host
	});
	response.end();
}).listen(80);
