'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const compact = require('lodash/compact');
const crypto = require('crypto');
const get = require('lodash/get');
const omit = require('lodash/omit');
const partial = require('lodash/partial');
const passport = require('passport');

const db = require('../data');

const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ITERATIONS = 20000;

const bearerConfig = {
	passReqToCallback: true
};

const localConfig = {
	passReqToCallback: true
};

const oauthConfig = {
	authorizationURL: 'https://www.provider.com/oauth2/authorize',
	tokenURL: 'https://www.provider.com/oauth2/token',
	clientID: '123-456-789',
	clientSecret: 'shhh-its-a-secret',
	callbackURL: 'https://www.example.com/auth/provider/callback',
	passReqToCallback: true
};


function errorHandler(request, done, error) {
	request.flash('error', error);
	done(error);
}

function failureHandler(request, done, failure) {
	request.flash('warn', failure);
	done(null, false);
}

function hash(password, salt, iterations) {
	// see https://nakedsecurity.sophos.com/2013/11/20/serious-security-how-to-store-your-users-passwords-safely/
	return crypto.pbkdf2Sync(password, salt, iterations, HASH_BYTES, 'sha256WithRSAEncryption').toString('hex');
}

function successHandler(request, done, success) {
	request.flash('info', success);
	done(null, success);
}

function validate(request, done, user, password, secret) {
	request.flash('debug', secret);
	if (hash(password, secret.salt, +secret.iterations) === secret.hash) {
		successHandler(request, done, user);
	} else {
		failureHandler(request, done, {login: false, reason: 'password'});
	}
}


function bearerVerify(request, token, done) {
	request.flash('info', {verify: 'bearer', token});
	done(null, {token});
}

function localVerify(request, username, password, done) {
	request.flash('info', {verify: 'local', username});
	db.search('user', 'handle', username)
	.then(result => {
		const user = compact(result).pop();
		if (user) {
			db.get(`secret:${user.id}`)
			.then(partial(validate, request, done, user, password))
			.catch(partial(errorHandler, request, done));
		} else {
			failureHandler(request, done, {login: false, reason: 'username'});
		}
	})
	.catch(partial(errorHandler, request, done));
}

function oauthVerify(request, accessToken, refreshToken, profile, done) {
	request.flash('info', {verify: 'oauth', profile});
	done(null, {accessToken, refreshToken, profile});
}


function serialize(user, done) {
	done(null, get(user, 'id'));
}

function deserialize(id, done) {
	db.get(`user:${id}`)
	.then(user => done(null, user));
}

passport.use(new BearerStrategy(bearerConfig, bearerVerify));
passport.use(new LocalStrategy(localConfig, localVerify));
passport.use(new OAuth2Strategy(oauthConfig, oauthVerify));

passport.serializeUser(serialize);
passport.deserializeUser(deserialize);

module.exports = passport;
