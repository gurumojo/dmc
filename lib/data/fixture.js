'use strict';
const Promise = require('bluebird');
const includes = require('lodash/includes');
const partial = require('lodash/partial');
const readdir = require('fs').readdirSync;
const redis = require('redis');

const logger = require('../logger');

const DISCOVERY_BLACKLIST = [];
const LOCAL_JSON_PATH = 'etc';

Promise.promisifyAll(redis.RedisClient.prototype); // direct execution
//Promise.promisifyAll(redis.Multi.prototype); // transactional execution

function discover(namespace, file) {
	if (!includes(DISCOVERY_BLACKLIST, file) && file.indexOf('.') !== 0) {
		const member = file.slice(0, file.indexOf('.'));
		namespace[member] = require(`./${LOCAL_JSON_PATH}/${file}`);
	}
	return namespace;
}

function list(result) {
	logger.info('fixture.list', {keys:result});
	result.forEach(key => {
		const type = key.slice(0, key.indexOf(':'));
		db.hgetallAsync(key).then(
			partial(logger.debug, `fixture.${type}`),
			partial(logger.error, `fixture.${type}`)
		);
	});
}

function load() {
	for (member in namespace) {
		namespace[member].forEach(instance => db.hmset(
			`${singular(member)}:${instance.id}`, instance
		));
	}
}

function poll() {
	logger.debug('fixture.poll', {complete});
	if (complete) {
		clearInterval(interval);
		db.quit();
	}
}

function singular(name) {
	return name.slice(0, -1);
}


const namespace = readdir(`${__dirname}/${LOCAL_JSON_PATH}`).reduce(discover,  {});
//logger.level('debug');
logger.debug('fixture.namespace', namespace);

const db = redis.createClient();
const interval = setInterval(poll, 10);
let complete = false;
let member = null;

db.on('connect', () => {
	db.flushdbAsync()
	.then(load)
	.then(() => db.keysAsync('*'))
	.then(list)
	.catch(partial(logger.error, 'redis.keys'))
	.finally(() => complete = true);
});
