exports.start = function(response) {
	response.writeHead(200, headers);
}

exports.exit = function(response, status) {
	response.writeHead(status, headers);
	switch(status) {
		case 404: {
			response.end('404 Not Found.');
			break;
		}
		case 500: {
			response.end('Internal Server Error.');
			break;
		}
	}
}

exports.safe_require = function(module_id) {
	try {
		return require(module_id);
	} catch(e) {
		console.log('module '+module_id+' does not exist');
	}
}
