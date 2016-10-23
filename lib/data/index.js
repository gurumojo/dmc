'use strict';
const Promise = require('bluebird');
const isArray = require('lodash/isArray');
const isString = require('lodash/isString');
const omit = require('lodash/omit');
const partial = require('lodash/partial');
const redis = require('redis')

const logger = require('../logger')
const roles = require('../../etc/roles.json')
const users = require('../../etc/users.json')

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
Promise.promisifyAll(redis.Multi.prototype); // transactional execution

function get(collection) {
	if (isString(collection)) {
		return db.hgetallAsync(collection);
	} else {
		return db.getAsync(collection);
	}
}

function keys(collection) {
	if (isString(collection)) {
		return db.hkeysAsync(collection);
	}
}

function list(result) {
	result.forEach(key => {
		const type = key.slice(0, key.indexOf(':'));
		get(key).then(
			partial(logger.info, type),
			partial(logger.error, type)
		);
	});
}

function set(collection, key, value) {
	if (isString(key)) {
		return db.hsetAsync(collection, key, value);
	} else {
		return db.hmsetAsync(collection, key);
	}
}

function vals(collection) {
	if (isString(collection)) {
		return db.hvalsAsync(collection);
	}
}


const db = redis.createClient();

db.on('connect', () => {
	db.infoAsync('server').then(info => console.log(info));
	db.infoAsync('keyspace').then(info => console.log(info));
	roles.forEach(role => db.hmset(`role:${role.id}`, role));
	users.forEach(user => db.hmset(`user:${user.id}`, user));
	db.keysAsync('*').then(list, partial(logger.error, 'db.keys'));
});


module.exports = {
	get,
	keys,
	set,
	vals
};
