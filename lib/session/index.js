'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const compact = require('lodash/compact');
const omit = require('lodash/omit');
const passport = require('passport');

const db = require('../data');

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

function bearerVerify(request, token, done) {
	request.flash('info', {strategy: 'bearer', token});
	done(null, {token});
}

function localVerify(request, username, password, done) {
	request.flash('info', {strategy: 'local', username});
	db.search('user', 'name', username)
	.then(result => {
		const user = compact(result).pop();
		if (user) {
			if (password === user.secret) {
				request.flash('info', {login: true});
				done(null, omit(user, 'secret'));
			} else {
				request.flash('warn', {login: false, reason: 'password'});
				done(null, false);
			}
		} else {
			request.flash('warn', {login: false, reason: 'username'});
			done(null, false);
		}
	})
	.catch(error => {
		request.flash('error', error);
		done(null, false);
	});
}

function oauthVerify(request, accessToken, refreshToken, profile, done) {
	request.flash('info', {strategy: 'oauth', profile});
	done(null, {accessToken, refreshToken, profile});
}

function serialize(user, done) {
	done(null, user.id);
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
