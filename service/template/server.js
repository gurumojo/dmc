'use strict';
const hostname = require('os').hostname();
const pick = require('lodash/pick');
const service = require('express')();

const port = 80;

service.get('/', (request, response) => {
	request.datetime = new Date();
	console.log(pick(request, ['datetime', 'headers', 'body']));
	response.send(`Greetings from ${hostname}`);
});

service.listen(port, () => {
	console.log(`Running on ${port}`);
});
