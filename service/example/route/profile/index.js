'use strict';
const logger = require('../../lib/logger');
const router = require('express').Router();
const session = require('../../lib/session');


router.get('/profile', (request, response) => {
	logger.info('profile', request.user);
	response.send(`<div>
		<a href="/">home</a>
		<div>${JSON.stringify(request.user, null, '  ')}</div>
	</div>`);
});


module.exports = router;
