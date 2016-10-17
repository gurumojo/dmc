'use strict';
const passport = require('../../middleware/session/config');
const router = require('express').Router();

const form = `<form method="post">
	<input name="username" value="theguy">
	<input name="password" value="$3cr3t">
	<button>post</button>
</form>`;


router.get('/login', (request, response) => response.send(form));

router.post('/login',
	passport.authenticate('local', {failureRedirect: '/login'}),
	(request, response) => {
		request.flash('info', {login: true});
		request.flash('debug', request.user);
		response.redirect('/profile');
	}
);

module.exports = router;
