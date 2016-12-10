'use strict';
const each = require('lodash/each');
const every = require('lodash/every');
const has = require('lodash/has');
const partial = require('lodash/partial');
const process = require('process');
const redis = require('redis');

const logger = require('../logger');
logger.level(process.env.GURUMOJO === 'development' ? 'debug' : 'debug');

const host = process.env.GURUMOJO_REDIS_HOSTNAME;
const registry = {};
let queue = null;


function configure(channel) {
	logger.debug('pubsub.configure', {channel});
	registry[channel].on('subscribe', (channel, count) => {
		queue.publish(channel, prepare({subscribe: channel}));
		logger.debug('pubsub.configure', {count});
	});
	registry[channel].on('message', (channel, message) => {
		logger.debug(`pubsub.${channel}`, {message});
	});
}

function initialize() {
	logger.debug('pubsub.initialize', {active: false});
	if (!queue) {
		queue = create('queue');
	}
	each(registry, (object, channel, connection) => {
		if (!connection[channel]) {
			connection[channel] = create(channel);
			connection[channel].on('connect', partial(configure, channel));
		}
	});
}

function create(channel) {
	logger.debug('pubsub.create', {channel});
	const connection = redis.createClient({host});
	connection.on('connect', partial(fulfill, channel));
	connection.on('error', partial(logger.error, `pubsub.${channel}`));
	return connection;
}

function fulfill(channel) {
	logger.debug('pubsub.fulfill', {channel});
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
	if (!registry[channel]) {
		logger.warn('pubsub.publish', {invalid: channel});
	} else {
		logger.debug('pubsub.publish', {channel});
		queue.publish(channel, prepare(message));
	}
}

function quit() {
	logger.debug('pubsub.quit', {shutdown: true});
	each(registry, (object, channel, connection) => {
		object.unsubscribe();
		object.quit();
		connection[channel] = null;
	});
	queue.quit();
	queue = null;
}

function subscribe(channel, handler) {
	logger.debug('pubsub.subscribe', {channel});
	if (channel && !has(registry, channel)) {
		registry[channel] = null;
	}
	if (!every(registry)) {
		initialize();
	}
	registry[channel].subscribe(channel);
	if (handler) {
		registry[channel].on('message', handler);
	} else {
		return registry[channel];
	}
}


module.exports = {
	publish,
	quit,
	subscribe
};
