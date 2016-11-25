'use strict';
const router = require('express').Router();


router.get('/profile', (request, response) => {
	if (!request.user) {
		request.flash('error', {profile: 'login session required'});
		response.redirect('/login');
	} else {
		response.send(`
			<div>
				<a href="/">home</a>
				<pre>${JSON.stringify(request.user, null, '  ')}</pre>
				<a href="/logout">logout</a>
			</div>
		`);
	}
});


module.exports = router;
