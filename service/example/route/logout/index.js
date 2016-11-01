'use strict';
const router = require('express').Router();
const session = require('../../lib/session');


router.get('/logout', (request, response) => {
	const form = `
		<form method="post">
			<input name="session" value="${request.sessionID}">
			<button>post</button>
		</form>
	`;

	if (request.user) {
		response.send(form);
	} else {
		request.flash('warn', {logout: 'no active session found'});
		response.redirect('/login');
	}
});

router.post('/logout', (request, response) => {
	if (request.user) {
		request.logout();
		response.redirect('/login');
	} else {
		request.flash('warn', {logout: 'no active session found'});
		response.redirect('/login');
	}
});

module.exports = router;
