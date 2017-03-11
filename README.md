Docker Management Console
=========================

Development tools for managing `node` services via `docker-compose`.


TL;DR
-----

`npm i -g yarn && ./bin/install && ./bin/up && ./bin/status`


Prerequisite
------------

Before diving in, these dependencies must be installed:

* `docker`
* `docker-compose`
* `jq`
* `node`
* `npm`


Getting Started
---------------

These three required (and two optional) steps should be all that is necessary to
get a basic example service (or your awesome suite of services based on this
framework tested and) running:

* install package manager: `$ npm install --global yarn`
* install local dependencies: `$ ./bin/install`
* run optional tests: `$ ./bin/test`
* start services: `$ ./bin/up`
* verify: `$ ./bin/status`

The example service provided allows for HTTP API and Redis message publishing
to submit requests. This presents options for reuse of the same service code
from clients such as `curl`, browsers, and apps to containers observing queues
and direct runtime administration via `redis-cli`.


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
defined in `./etc/docker/service.yml`.

To minimize thrashing caused by filesystem changes it is necessary to run the
`./bin/publish` script to copy changes saved under various shared directories
into their respective docker volumes. This sync triggers a nodemon watcher
restart in a way similar to saving changes directly into a service source
directory would restart the given service, but it does so for every dependent
service at once.

Abstraction of the various layers of locally built docker images with a view
toward ease of management and speed of rebuild execution currently utilize
persistent wrapper images for any public base image (e.g. node, redis). This
allows for local configuration, optimization, and upgrades to be run only as
often as necessary on intermediate layers. This yields easily replaceable top
level union filesystems and `./opt/*/Dockerfile` declarations as simple as:
```
FROM dmc:node

CMD ["npm", "start"]
```
The conspicuous absence of any build commands may be explained by the focus of
this library on development and test tooling. Any microservices required by an
application have their dependencies downloaded by running `./bin/install`.
Subsequent runs pluck from a local package cache while applying any updates to
`./opt/*/package.json` in order to minimize network traffic.

The resulting node_modules collections are mounted into the working directory
of containers started via `./bin/up`, eliminating the possibility of conflicts
between copies. This also has the benefit of allowing local changes on that
filesystem to restart the service via watcher process in a container.


Management
----------

Historic usage of NPM commands has been replaced here by Yarn for various reasons.
See https://yarnpkg.com/en/docs/cli/ for details on how it compares. Of special
interest are the package caching and strict reproducible builds provided on top
of familiar package management features.

An architectural decision to take advantage of package caching embraces an
emphasis on ephemeral containers (and thereby rapid repeatable builds important
in test environments). This also eliminates the need for hosting images with a
container management service for any code in development.

DMC manages collection of services, so a typical `npm install` or `yarn` call is
not adequate for providing dependencies here. Wrapper scripts run those commands
for each package under `./opt` (see `./bin/check`, `./bin/install`,
`./bin/upgrade` for details). Future work will likely transition away from this
naive approach toward more advanced usage of image and repository links.


Usage
-----

Maintenance Scripts

* run `yarn` in each `./opt/*` directory: `$ ./bin/install [-f|--force]`

* run `yarn check` and `yarn outdated` in each `./opt/*` directory: `$ ./bin/check`

* run `yarn upgrade` in each `./opt/*` directory: `$ ./bin/upgrade`

* build shared filesystem containers: `$ ./bin/initialize`

* delete all containers, images, networks, volumes: `$ ./bin/purge`

* check the current `docker-compose` environment: `$ ./bin/status [-v|--verbose]`


Workflow Scripts

* kick off a test runner to exercise the system: `$ ./bin/test`

* run `docker-compose up -d` on dependencies and services: `$ ./bin/up`

* pass a container name to (re)instate test fixture data: `$ ./bin/fixture <redis>`

* sync updates to shared (docker volume) filesystem hierarchies: `$ ./bin/publish`

* save shared (docker volume) modifications to host filesystem: `$ ./bin/archive`

* run `docker-compose down` and remove all volumes, images, orphans: `$ ./bin/down`

