Docker Management Console
=========================

Proof of concept work toward managing Node.js apps via Docker on AWS.


TL;DR
-----
`npm install -g yarn && ./bin/install && ./bin/test && ./bin/up`


Getting Started
---------------

* install package manager: `npm install -g yarn`
* install dependencies: `yarn install`
* run the tests: `yarn test`
* fire it up: `yarn start`


On the CLI
----------

* see scripts in `./bin`


Configuration
-------------

To deploy services, first update `./etc/config.json` to include any necessary
environment and application configuration. The minimum fields required are:

`{"application": "{String}", "environment": "{String}"}`

Changes to those strings effect the environments cobbled together by the scripts
found under the `./bin` directory (which make use of various `./docker-*.yml`
configuration files). Adding a new working directory under `./service/<name>/`
convention and updating `./docker-compose.yml` to include the new container
definition is all that remains to bring up a new service in a given environment
from a DMC perspective.

DMC provides for shared persistent volumes to simplify configuration and
dependency management. Anything added under the `./etc` or `./lib` directories
is made available to any container that extends from the default definition in
`./docker-service.yml`.


Management
----------

Historic usage of NPM commands has been replaced here by Yarn for various reasons.
See https://yarnpkg.com/en/docs/cli/ for details on how it compares. Of special
interest are the package caching and strict reproducible builds.


Usage
-----

`./bin/check`: run `yarn check` and `yarn outdated` for each `./services/*` directory

`./bin/down`: run `docker-compose down` and remove all volumes, images, orphans

`./bin/env`: this file is sourced to set environment variables for other scripts

`./bin/initialize`: purge any previous artifacts and build shared filesystems

`./bin/install`: loop through `./services/*` running `yarn` (optionally forced)

`./bin/publish`: sync updates to shared filesystem hierarchies (docker volumes)

`./bin/purge`: delete all containers, images, networks, volumes

`./bin/test`: kick off a test runner to exercise the system

`./bin/up`: run `docker-compose up -d` on dependencies and services

`./bin/upgrade`: loop through `./services/*` running `yarn upgrade`

