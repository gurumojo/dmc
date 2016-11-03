'use strict';
const Promise = require('bluebird');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isPlainObject');
const isString = require('lodash/isString');
const process = require('process');
const redis = require('redis');

const logger = require('../logger');

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

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

function keys(pattern) {
	logger.debug('data.keys', {pattern});
	if (isString(pattern)) {
		return db.hkeysAsync(pattern);
	} else {
		return Promise.reject(new Error('string input required'));
	}
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


const db = redis.createClient({
	host: `${process.env.GURUMOJO}.db`
});

db.on('connect', () => {
	db.infoAsync('server').then(info => console.log(info));
	db.infoAsync('keyspace').then(info => console.log(info));
});


module.exports = {
	get,
	keys,
	quit: db.quit,
	search,
	set,
	vals
};
