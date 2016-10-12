Docker Management Console
=========================

Proof of concept work toward managing Node.js apps via Docker on AWS.


TL;DR
-----
`npm install && npm test && npm start`


Getting Started
---------------

* install dependencies: `npm install`
* run the tests: `npm test`
* fire it up: `npm start`


On the CLI
----------

* display help text: `./bin/dmc --help --verbose`


Configuration
-------------

To deploy services, first update `./etc/config.json` to include a new container
definition with a unique name and port assignment (also be sure to tag it with
an active environment). This is all that is necessary to boostrap a default
node environment in a new working directory via `./service/<name>/` convention
(where <name> matches the "image" attribute in the container definition).

