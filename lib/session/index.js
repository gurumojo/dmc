'use strict';
const BearerStrategy = require('passport-http-bearer').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const omit = require('lodash/omit');
const passport = require('passport');

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

const users = [{
	id: 1,
	name: 'theguy',
	email: 'theguy@gurumojo.net',
	secret: '$3cr3t'
}];

const user = users[0];

function bearerVerify(request, token, done) {
	request.flash('info', {strategy: 'bearer', token});
	done(null, {token});
}

function localVerify(request, username, password, done) {
	request.flash('info', {strategy: 'local', username});
	if (username === user.name && password === user.secret) {
		done(null, omit(user, 'secret'));
	} else {
		request.flash('warn', {login: false});
		done(null, false);
	}
}

function oauthVerify(request, accessToken, refreshToken, profile, done) {
	request.flash('info', {strategy: 'oauth', profile});
	done(null, {accessToken, refreshToken, profile});
}


passport.use(new BearerStrategy(bearerConfig, bearerVerify));
passport.use(new LocalStrategy(localConfig, localVerify));
passport.use(new OAuth2Strategy(oauthConfig, oauthVerify));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, user));

module.exports = passport;
