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

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

const host = process.env.DMC_REDIS_HOST;
const init = Date.now();
const poll = {delay: process.env.DMC_POLL_TIMEOUT || 10, path: __dirname};
let db = null;
let wait = false;


function connect() {
	logger.debug('data.connect', {active: false});
	db = redis.createClient({host});
	db.on('connect', connectionInfo);
	db.on('error', partial(logger.error, 'data.redis'));
}

function connectionInfo() {
	logger.debug('data.connect', {active: true});
	db.infoAsync('server')
	.then(server => logger.debug('data.server', rewrite(server)));
	db.infoAsync('keyspace')
	.then(keys => logger.debug('data.keys', rewrite(keys)));
	clearInterval(poll.interval);
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
		poll.timestamp = Date.now();
		poll.uptime = poll.timestamp - init;
		dns.resolve(host, (error, ipv4) => {
			if (error) {
				logger.error('DNS resolution failure', error);
			} else if (!wait) {
				logger.debug('data.poll', omit(poll, 'interval'));
				wait = true;
				connect();
			}
		});
	} else {
		logger.error('data.poll', {required: 'process.env.DMC_REDIS_HOST'});
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

function rewrite(item) {
	if (isString(item)) {
		return item
		.replace(/\s/gm, ' ')
		.replace(/# \w*  /, '')
		.replace(/  /g, ', ')
		.replace(/:/g, '=')
		.replace(/,(\w)/g, (m, p1) => `, ${p1}`)
		.replace(/, $/, '')
	}
	return item;
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
