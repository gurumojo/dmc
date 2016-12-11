'use strict';
const logger = require('../logger');

//logger.level('debug');

function object(input) {
	logger.debug('json.object', {input: typeof input});
	let object = null;
	if (typeof input === 'string') {
		try {
			object = JSON.parse(input);
		} catch (x) {
			logger.error('json.object', {message: x.message});
		}
	} else {
		logger.error('json.object', {required: 'input', type: 'string'});
	}
	return object;
}

function pretty(input) {
	logger.debug('json.pretty', {input: typeof input});
	let pretty = '';
	if (typeof input === 'object') {
		try {
			pretty = JSON.stringify(input, null, '  ');
		} catch (x) {
			logger.error('json.pretty', {message: x.message});
		}
	} else {
		logger.error('json.pretty', {required: 'input', type: 'object'});
	}
	return pretty;
}

function string(input) {
	logger.debug('json.string', {input: typeof input});
	let string = '';
	if (typeof input === 'object') {
		try {
			string = JSON.stringify(input);
		} catch (x) {
			logger.error('json.string', {message: x.message});
		}
	} else {
		logger.error('json.string', {required: 'input', type: 'object'});
	}
	return string;
}

module.exports = {
	object,
	pretty,
	string
};
