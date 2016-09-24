'use strict';
const service = require('express')();

const hostname = require('os').hostname();

const port = 8000;


service.get('/', (request, response) => {
  response.send(`Greetings from ${hostname}`);
});

service.listen(port);
console.log(`Running on http://localhost:${port}/`);
