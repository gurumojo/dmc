'use strict'
const winston = require('winston');

winston.cli();


function apply(level, message, meta) {
	winston.log(level, `${new Date().toISOString()} ${message}:`, meta);
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

function warn(message, meta) {
	apply('warn', message, meta);
}


module.exports = {
	profile: winston.profile,
	debug,
	info,
	warn,
	error
};
