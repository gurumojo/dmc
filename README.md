Docker Management Console
=========================

Proof of concept work toward managing Node.js apps via Docker on AWS.


TL;DR
-----
`npm install -g yarn && yarn install && yarn test && yarn start`


Getting Started
---------------

* install package manager: `npm install -g yarn`
* install dependencies: `yarn install`
* run the tests: `yarn test`
* fire it up: `yarn start`


On the CLI
----------

* see scripts in `./bin`

* display help text: `./bin/dmc --help --verbose` (deprecated)


Configuration
-------------

To deploy services, first update `./etc/config.json` to include a new container
definition with a unique name and port assignment (also be sure to tag it with
an active environment). This is all that is necessary to boostrap a default
node environment in a new working directory via `./service/<name>/` convention
(where <name> matches the "image" attribute in the container definition).


Management
----------

Historic usage of NPM commands has been replaced here by Yarn for various reasons.
See https://yarnpkg.com/en/docs/cli/ for details on how it compares. Of special
interest are the package caching and strict reproducible builds.

