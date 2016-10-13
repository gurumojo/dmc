'use strict';
const config = require('./etc/config');
const hostname = require('os').hostname();
const pick = require('lodash/pick');
const service = require('express')();

const port = 80;

function datetime(req, res, next) {
	req.datetime = new Date().toISOString();
	next();
}

function timestamp(req, res, next) {
	req.timestamp = Date.now();
	next();
}

service.use(datetime);
service.use(timestamp);

service.get('/', (req, res) => {
	console.log(pick(req, ['datetime', 'headers', 'body']));
	res.send(`Greeting ${req.timestamp} from ${hostname}`);
});

service.listen(port, () => {
	console.log({
		application: config.application,
		datetime: new Date().toISOString(),
		init: `Example Service running on http://${hostname}:${port}/`
	});
});
