'use strict';
const router = require('express').Router();

const json = require('../../lib/json');


router.get('/profile', (request, response) => {
	if (!request.user) {
		request.flash('error', {profile: 'login session required'});
		response.redirect('/login');
	} else {
		response.send(`
			<div>
				<a href="/">home</a>
				<pre>${json.pretty(request.user)}</pre>
				<a href="/logout">logout</a>
			</div>
		`);
	}
});


module.exports = router;
