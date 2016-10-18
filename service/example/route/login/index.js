'use strict';
const router = require('express').Router();
const session = require('../../lib/session');

const form = `<form method="post">
	<input name="username" value="theguy">
	<input name="password" value="$3cr3t">
	<button>post</button>
</form>`;


router.get('/login', (request, response) => response.send(form));

router.post('/login',
	session.authenticate('local', {failureRedirect: '/login'}),
	(request, response) => {
		request.flash('info', {login: true});
		request.flash('debug', request.user);
		response.redirect('/profile');
	}
);

module.exports = router;