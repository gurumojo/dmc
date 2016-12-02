'use strict';
const partial = require('lodash/partial');
const process = require('process');
const redis = require('redis');

const logger = require('../logger');
logger.level(process.env.GURUMOJO === 'development' ? 'debug' : 'info');

const host = process.env.GURUMOJO_REDIS_HOSTNAME;
const init = Date.now();

let complete = 0;
let queue = null;
let registry = null;

function check() {
	if (!registry) {
		logger.debug('pubsub.check', {registry});
		connect();
	}
}

function connect() {
	logger.debug('pubsub.connect', {active: false});
	queue = redis.createClient({host});
	queue.on('connect', fulfill);
	queue.on('error', partial(logger.error, 'pubsub.queue'));
	registry = redis.createClient({host});
	registry.on('connect', fulfill);
	registry.on('error', partial(logger.error, 'pubsub.registry'));
}

function fulfill() {
	complete++;
	logger.debug('pubsub.fulfill', {complete});
	if (complete === 2) {
		logger.debug('pubsub.connect', {active: true});
	}
}

function prepare(input) {
	let message = '';
	try {
		message = JSON.stringify(input);
	} catch (x) {
		logger.error('pubsub.prepare', x);
	}
	return message;
}

function publish(channel, message) {
	check();
	queue.publish(channel, prepare(message));
}

function quit() {
	complete = 0;
	queue.quit();
	queue = null;
	registry.unsubscribe();
	registry.quit();
	registry = null;
}

function subscribe(channel) {
	check();
	registry.on('subscribe', (channel, count) => {
		queue.publish(channel, prepare({subscribe: channel}));
		queue.publish(channel, prepare({count: count}));
	});
	registry.on('message', (channel, message) => {
		logger.info(`pubsub.${channel}`, {message});
	});
	registry.subscribe(channel);
}


module.exports = {
	connect,
	publish,
	quit,
	subscribe
};
