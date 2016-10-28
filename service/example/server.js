'use strict';
const bodyParser = require('body-parser');
const config = require('./etc/config');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressSession = require('express-session');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const hostname = require('os').hostname();
const includes = require('lodash/includes');
const logger = require('./lib/logger');
const partial = require('lodash/partial');
const passport = require('./lib/session');
const pick = require('lodash/pick');
const readdir = require('fs').readdirSync;

const DISCOVERY_BLACKLIST = ['Dockerfile', 'etc', 'lib', 'node_modules'];
const FAVICON_PATH = `${__dirname}/etc/favicon.png`;
const PORT = 80;
const REQUEST_WHITELIST = ['method', 'path', 'query', 'body', 'headers', 'sessionID'];
const SESSION_SECRET = 'y0uRbl00Dt4st3Slik3$yruP';
const STATIC_PATH = `${__dirname}/etc/public`;


function datetime(request, response, next) {
	request.datetime = new Date().toISOString();
	next();
}

function discover(type, array, value) {
	if (!includes(DISCOVERY_BLACKLIST, value) && value.indexOf('.') < 0) {
		array.push(require(`./${type}/${value}`))
	}
	return array;
}

function requestLogger(request, response, next) {
	if (response.locals.profile.length) {
		loop('profile', response.locals.profile);
	}
	if (response.locals.debug.length) {
		loop('debug', response.locals.debug);
	}
	if (response.locals.info.length) {
		loop('info', response.locals.info);
	}
	if (response.locals.warn.length) {
		loop('warn', response.locals.warn);
	}
	if (response.locals.error.length) {
		loop('error', response.locals.error);
	}
	logger.info('example.request', pick(request, REQUEST_WHITELIST));
	next();
}

function loop(level, flash) {
	flash.forEach(message => logger[level]('example.message', message));
}

function message(request, response, next) {
    response.locals.profile = request.flash('profile');
    response.locals.debug = request.flash('debug');
    response.locals.info = request.flash('info');
    response.locals.warn = request.flash('warn');
    response.locals.error = request.flash('error');
    next();
}

function sessionLogger(request, response, next) {
	logger.info('example.session', request.user);
	next();
}

function timestamp(request, response, next) {
	request.timestamp = Date.now();
	next();
}


const service = express();
service.disable('x-powered-by');

service.use(datetime);
service.use(timestamp);

//service.use(express.static(STATIC_PATH));
service.use(favicon(FAVICON_PATH));
service.use(cookieParser());
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({extended: true}));

service.use(flash());
service.use(expressSession({
	resave: false,
	saveUninitialized: false,
	secret: SESSION_SECRET
}));

service.use(passport.initialize());
service.use(passport.session());

service.use(message);
service.use(requestLogger);
service.use(sessionLogger);

readdir(`${__dirname}/middleware`)
.reduce(partial(discover, 'middleware'),  [])
.forEach(middleware => service.use(middleware));

readdir(`${__dirname}/route`)
.reduce(partial(discover, 'route'), [])
.forEach(route => service.use(route));

service.get('/*', (request, response) => {
	response.send(`
		<div>
			<h1><a href="/login">${hostname}</a></h1>
			<div>${request.timestamp}</div>
		</div>
	`);
});

service.listen(PORT, () => {
	logger.level('debug');
	logger.info('init', {
		application: config.application,
		uri: `http://${hostname}:${PORT}/`
	});
});
