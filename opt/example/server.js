'use strict';
const init = Date.now();

const bodyParser = require('body-parser');
const express = require('express');
const expressSession = require('express-session');
const favicon = require('serve-favicon');
const flash = require('connect-flash');
const get = require('lodash/get');
const hostname = require('os').hostname();
const includes = require('lodash/includes');
const partial = require('lodash/partial');
const pick = require('lodash/pick');
const process = require('process');
const readdir = require('fs').readdirSync;
const RedisStore = require('connect-redis')(expressSession)

const config = require('./etc/config');
const json = require('./lib/json');
const logger = require('./lib/logger');
const passport = require('./lib/session');
const pubsub = require('./lib/pubsub');
const redact = require('./lib/redact');

const DISCOVERY_BLACKLIST = ['Dockerfile', 'node_modules', 'etc', 'lib', 'var'];
const FAVICON_PATH = `${__dirname}/etc/public/favicon.png`;
const REDIS_HOSTNAME = process.env.GURUMOJO_REDIS_HOSTNAME || 'localhost';
const REQUEST_WHITELIST = ['method', 'path', 'query', 'body', 'headers', 'sessionID'];
const SERVICE_PORT = process.env.GURUMOJO_SERVICE_PORT || 80;
const SESSION_SECRET = process.env.GURUMOJO_SESSION_SECRET || 'y0uRbl00Dt4st3Slik3$yruP';
const STATIC_PATH = `${__dirname}/etc/public`;

logger.level(process.env.GURUMOJO_ENVIRONMENT === 'development' ? 'debug' : 'info');


function datetime(request, response, next) {
	request.datetime = new Date().toISOString();
	next();
}

function delegate(channel, message) {
	const object = json.object(message);
	if (get(object, 'error')) {
		logger.error('example.delegate', error);
	}
	if (!get(object, 'subscribe')) {
		logger.info('example.delegate', object);
		logger.warn(`example.${object.method}`, {pending: 'message delegation'});
	}
}

function discover(type, array, value) {
	if (!includes(DISCOVERY_BLACKLIST, value) && value.indexOf('.') < 0) {
		array.push(require(`./${type}/${value}`))
	}
	return array;
}

function dispatch(level, flash) {
	flash.forEach(message => logger[level]('example.message', redact(message)));
}

function message(request, response, next) {
	Object.keys(logger).forEach(method => {
		response.locals[method] = request.flash(method);
	});
    next();
}

function requestLogger(request, response, next) {
	Object.keys(logger).forEach(method => {
		if (response.locals[method].length) {
			dispatch(method, response.locals[method]);
		}
	});
	logger.info('example.request', redact(pick(request, REQUEST_WHITELIST)));
	next();
}

function sessionLogger(request, response, next) {
	logger.debug('example.session', request.session);
	next();
}

function timestamp(request, response, next) {
	request.timestamp = Date.now();
	next();
}


const service = express();
service.disable('etag');
service.disable('x-powered-by');

service.use(datetime);
service.use(timestamp);

//service.use(express.static(STATIC_PATH));
service.use(favicon(FAVICON_PATH));

service.use(bodyParser.json());
service.use(bodyParser.urlencoded({extended: false}))

service.use(flash());

service.use(expressSession({
	resave: false,
	saveUninitialized: false,
	secret: SESSION_SECRET,
	store: new RedisStore({
		host: REDIS_HOSTNAME,
		prefix: 'session:',
		ttl: 3600
	})
}));

service.use(passport.initialize());
service.use(passport.session());

service.use(message);
service.use(requestLogger);
service.use(sessionLogger);

//readdir(`${__dirname}/middleware`)
//.reduce(partial(discover, 'middleware'),  [])
//.forEach(middleware => service.use(middleware));

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

service.listen(SERVICE_PORT, () => {
	logger.info('init', {
		application: config.application,
		timestamp: init,
		uri: `http://${hostname}:${SERVICE_PORT}/`
	});
	pubsub.subscribe('example', delegate);
});
