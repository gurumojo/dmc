'use strict';
const pick = require('lodash/pick');

const init = Date.now();

const interval = {
	delay: 1000,
	path: __dirname
};

function keepalive(interval) {
	interval.now = Date.now();
	interval.uptime = interval.now - init;
	console.log(pick(interval, ['now', 'uptime', 'path']));
}

keepalive(interval);

interval.timeout = setInterval(keepalive, interval.delay, interval);
