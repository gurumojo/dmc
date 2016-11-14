'use strict';
const Promise = require('bluebird');
const dns = require('dns');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isPlainObject');
const isString = require('lodash/isString');
const omit = require('lodash/omit');
const partial = require('lodash/partial');
const process = require('process');
const redis = require('redis');

const logger = require('../logger');
logger.level('debug');

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

const host = process.env.GURUMOJO_REDIS_HOSTNAME;
const init = Date.now();
const poll = {delay: process.env.GURUMOJO_POLL_TIMEOUT || 10, path: __dirname};
let db = null;
let wait = false;


function connect() {
	logger.debug('data.connect', poll);
	wait = true;
	db = redis.createClient({host});
	db.on('connect', connectionInfo);
	db.on('error', partial(logger.error, 'redis.createClient'));
}

function connectionInfo() {
	db.infoAsync('server').then(logger.debug);
	db.infoAsync('keyspace').then(logger.debug);
	clearInterval(poll.interval);
	wait = false;
}

function get(key) {
	logger.debug('data.get', {key});
	if (isString(key)) {
		return db.hgetallAsync(key);
	} else if (isArray(key)) {
		return db.hgetAsync(key);
	} else {
		return Promise.reject(new Error('string | string[] input required'));
	}
}

function keepalive(poll) {
	if (host) {
		poll.now = Date.now();
		poll.uptime = poll.now - init;
		dns.resolve(host, (error, ipv4) => {
			if (error) {
				logger.error('DNS resolution failure', error);
			} else if (!wait) {
				logger.debug('Connecting...', poll);
				connect();
			}
		});
	} else {
		logger.error('process.env.GURUMOJO_REDIS_HOSTNAME required', poll);
		clearInterval(poll.interval);
	}
}

function keys(pattern) {
	logger.debug('data.keys', {pattern});
	if (isString(pattern)) {
		return db.hkeysAsync(pattern);
	} else {
		return Promise.reject(new Error('string input required'));
	}
}

function quit() {
	db.quit();
	db = null;
}

function search(type, member, value) {
	logger.debug('data.search', {type, member, value});
	return db.keysAsync(`${type}:*`)
	.then(hits => Promise.map(hits, target => get([target, member])
		.then(item => (value === item ? get(target) : null))
	));
}

function set(key, member, value) {
	logger.debug('data.set', {key, member, value});
	if (isString(member)) {
		return db.hsetAsync(key, member, value);
	} else if (isObject(member)) {
		return db.hmsetAsync(key, member);
	} else {
		return Promise.reject(new Error(
			'(string, string, string) | (string, {string, ...}) input required'
		));
	}
}

function vals(key) {
	logger.debug('data.vals', {key});
	if (isString(key)) {
		return db.hvalsAsync(key);
	} else {
		return Promise.reject(new Error('string input required'));
	}
}


poll.interval = setInterval(keepalive, poll.delay, poll);


module.exports = {
	connect,
	get,
	keys,
	quit,
	search,
	set,
	vals
};
