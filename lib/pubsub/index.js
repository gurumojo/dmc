'use strict';
const each = require('lodash/each');
const every = require('lodash/every');
const has = require('lodash/has');
const partial = require('lodash/partial');
const process = require('process');
const redis = require('redis');

const logger = require('../logger');
logger.level(process.env.GURUMOJO === 'development' ? 'debug' : 'info');

const connection = {
	queue: null
};

const host = process.env.GURUMOJO_REDIS_HOSTNAME;


function connect() {
	logger.debug('pubsub.connect', {active: false});
	each(connection, (object, channel, collection) => {
		if (!collection[channel]) {
			initialize(channel);
		}
	});
}

function fulfill(channel) {
	if (every(connection)) {
		logger.debug('pubsub.connect', {active: true});
	} else {
		logger.debug('pubsub.fulfill', {channel});
	}
}

function initialize(channel) {
	logger.debug('pubsub.initialize', {channel});
	connection[channel] = redis.createClient({host});
	connection[channel].on('connect', partial(fulfill, channel));
	connection[channel].on('error', partial(logger.error, `pubsub.${channel}`));
	if (channel !== 'queue') {
		report(channel);
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
	logger.debug('pubsub.publish', {channel});
	if (!connection[channel]) {
		logger.error('subscription required', channel);
	} else {
		connection.queue.publish(channel, prepare(message));
	}
}

function quit() {
	logger.debug('pubsub.quit', {shutdown: true});
	each(connection, (object, channel, collection) => {
		if (channel !== 'queue') {
			object.unsubscribe();
		}
		object.quit();
		collection[channel] = null;
	});
}

function report(channel) {
	logger.debug('pubsub.report', {channel});
	connection[channel].on('subscribe', (channel, count) => {
		connection.queue.publish(channel, prepare({subscribe: channel}));
		connection.queue.publish(channel, prepare({count: count}));
	});
	connection[channel].on('message', (channel, message) => {
		logger.info(`pubsub.${channel}`, {message});
	});
}

function subscribe(channel) {
	logger.debug('pubsub.subscribe', {channel});
	if (channel && !has(connection, channel)) {
		connection[channel] = null;
	}
	if (!every(connection)) {
		connect();
	}
	connection[channel].subscribe(channel);
}


module.exports = {
	connect,
	publish,
	quit,
	subscribe
};
