'use strict';
const _ = require('lodash');

const LOGGER_BLACKLIST = ['cookie', 'flash', 'password', 'secret'];

function predicate(value, key) {
	return _.includes(LOGGER_BLACKLIST, key);
}

function scrub(item) {
	if (_.isObjectLike(item) && !_.isArray(item)) {
		return _.forEach(_.omitBy(item, predicate), (value, key, object) => {
			object[key] = _.isObject(value) ? _.omitBy(value, predicate) : value;
		});
	}
	return item;
}

module.exports = scrub;
