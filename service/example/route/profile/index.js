'use strict';
const router = require('express').Router();


router.get('/profile', (request, response) => {
	if (!request.user) {
		request.flash('error', {login: 'required'});
		response.redirect('/login');
	} else {
		response.send(`
			<div>
				<a href="/">home</a>
				<div>${JSON.stringify(request.user, null, '  ')}</div>
			</div>
		`);
	}
});


module.exports = router;
