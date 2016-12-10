Docker Management Console
=========================

Development tools for managing Node.js apps via Docker Compose.


TL;DR
-----

`npm install -g yarn && ./bin/install && ./bin/test && ./bin/up`


Prerequisite
------------

* `docker`
* `docker-compose`


Getting Started
---------------

* install package manager: `npm install -g yarn`
* install dependencies: `./bin/install`
* run the tests: `./bin/test`
* fire it up: `./bin/up`


Configuration
-------------

To deploy services, first update `./etc/config.json` to include any necessary
environment and application configuration. The minimum fields required are:

`{"application": "{String}", "environment": "{String}"}`

Changes to those strings affect the environments cobbled together by the scripts
found under the `./bin` directory (which make use of various `./etc/docker/*.yml`
configuration files). Adding a new working directory under the `./opt/<name>/`
convention and updating `./etc/docker/compose.yml` to include the new container
definition is all that remains to bring up a new service in a given environment
from a DMC perspective.

DMC provides for shared persistent volumes to simplify configuration and
dependency management. Anything added under the `./etc` or `./lib` directories
is made available to any container that extends from the default environment
defined in `./docker-service.yml`.


Management
----------

Historic usage of NPM commands has been replaced here by Yarn for various reasons.
See https://yarnpkg.com/en/docs/cli/ for details on how it compares. Of special
interest are the package caching and strict reproducible builds provided on top
of familiar package management features.

Because of the architectural decision to take advantage of package caching and
an emphasis on ephemeral containers and thereby rapid and repeatable builds,
typical `npm install` or even `yarn` calls are not adequate for providing all
dependencies for each microservice defined. Instead, we use wrapper scripts that
run those commands for each microservice package under `./opt` (see `./bin/check`,
`./bin/install`, `./bin/upgrade`). Future work will likely transition away from
this naive approach toward more advanced usage of image and repository links.


Usage
-----

`./bin/archive`: save shared (docker volume) modifications to host filesystem

`./bin/check`: run `yarn check` and `yarn outdated` in each `./opt/*` directory

`./bin/down`: run `docker-compose down` and remove all volumes, images, orphans

`./bin/env`: source this file to set environment variables in other scripts

`./bin/fixture`: pass a container name to (re)instate test fixture data

`./bin/initialize`: purge any previous artifacts and build shared filesystems

`./bin/install`: run `yarn` (optionally forced) in each `./opt/*` directory

`./bin/publish`: sync updates to shared (docker volume) filesystem hierarchies

`./bin/purge`: delete all containers, images, networks, volumes

`./bin/test`: kick off a test runner to exercise the system

`./bin/up`: run `docker-compose up -d` on dependencies and services

`./bin/upgrade`: run `yarn upgrade` in each `./opt/*` directory

