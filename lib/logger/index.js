'use strict'
const omit = require('lodash/omit');
const winston = require('winston');

const LOGGER_BLACKLIST = ['secret'];

const logger = new winston.Logger({
	transports: [
		new winston.transports.Console({level: 'info'})
		//new winston.transports.File({filename: 'error.log', level: 'error'})
	]
});

logger.cli();


function apply(level, message, meta) {
	const redacted = omit(meta, LOGGER_BLACKLIST);
	logger.log(level, `${new Date().toISOString()} ${message}:`, redacted);
}

function debug(message, meta) {
	apply('debug', message, meta);
}

function error(message, meta) {
	apply('error', message, meta);
}

function info(message, meta) {
	apply('info', message, meta);
}

function level(option) {
	logger.transports.console.level = option;
}

function warn(message, meta) {
	apply('warn', message, meta);
}


module.exports = {
	profile: winston.profile,
	level,
	debug,
	info,
	warn,
	error
};
