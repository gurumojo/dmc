'use strict';
const each = require('lodash/each');
const every = require('lodash/every');
const has = require('lodash/has');
const partial = require('lodash/partial');
const process = require('process');
const redis = require('redis');

const json = require('../json');
const logger = require('../logger');

const host = process.env.GURUMOJO_REDIS_HOSTNAME;
const registry = {};
let service = null;
const success = true;


function configure(channel) {
	logger.debug('pubsub.configure', {channel});
	registry[channel].on('subscribe', (channel, count) => {
		logger.debug('pubsub.subscribe', {channel, count, success});
		service.publish(channel, json.string({subscribe: success}));
	});
	registry[channel].on('message', (channel, message) => {
		logger.debug('pubsub.message', {channel, message});
	});
}

function initialize() {
	logger.debug('pubsub.initialize', {active: false});
	if (!service) {
		service = create('service');
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
	connection.on('connect', partial(logger.debug, `pubsub.${channel}`, {success}));
	connection.on('error', partial(logger.error, `pubsub.${channel}`));
	return connection;
}

function publish(channel, message) {
	if (!registry[channel]) {
		logger.warn('pubsub.publish', {invalid: channel});
	} else {
		logger.debug('pubsub.publish', {channel});
		service.publish(channel, json.string(message));
	}
}

function quit() {
	logger.debug('pubsub.quit', {shutdown: true});
	each(registry, (object, channel, connection) => {
		object.unsubscribe();
		object.quit();
		connection[channel] = null;
	});
	service.quit();
	service = null;
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
