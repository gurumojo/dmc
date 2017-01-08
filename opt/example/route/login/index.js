'use strict';
const router = require('express').Router();
const session = require('../../lib/session');

const form = `
	<form method="post">
		<input name="username" value="user0">
		<input name="password" value="xyz">
		<button>post</button>
	</form>
`;


router.get('/login', (request, response) => {
	if (request.user) {
		request.flash('warn', {login: `session active for ${request.user.handle}`});
		response.redirect('/profile');
	} else {
		response.send(form);
	}
});

router.post('/login', session.authenticate('local', {failureRedirect: '/login'}),
	(request, response) => {
		request.flash('debug', request.user);
		response.redirect('/profile');
	}
);

module.exports = router;
