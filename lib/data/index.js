'use strict';
const Promise = require('bluebird');
const isArray = require('lodash/isArray');
const isObject = require('lodash/isPlainObject');
const isString = require('lodash/isString');
const omit = require('lodash/omit');
const partial = require('lodash/partial');
const redis = require('redis')

const logger = require('../logger')
const roles = require('../../etc/roles.json')
const users = require('../../etc/users.json')

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

function keys(key) {
	logger.debug('data.keys', {key});
	if (isString(key)) {
		return db.hkeysAsync(key);
	} else {
		return Promise.reject(new Error('string input required'));
	}
}

function list(result) {
	logger.debug('data.list', {result});
	result.forEach(key => {
		const type = key.slice(0, key.indexOf(':'));
		get(key).then(
			partial(logger.info, type),
			partial(logger.error, type)
		);
	});
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
		return Promise.reject(new Error('(string, string, string) | (string, {string, ...}) input required'));
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


const db = redis.createClient();

db.on('connect', () => {
	db.infoAsync('server').then(info => console.log(info));
	db.infoAsync('keyspace').then(info => console.log(info));
	roles.forEach(role => db.hmset(`role:${role.id}`, role));
	users.forEach(user => db.hmset(`user:${user.id}`, user));
	db.keysAsync('*').then(list, partial(logger.error, 'redis.keys'));
});


module.exports = {
	get,
	keys,
	search,
	set,
	vals
};
