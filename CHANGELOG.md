### 0.1.0 (Dec 4, 2013)

* Initial release of MVP

### 0.1.1 (Dec 4, 2013)

* Cleanup of startup banner
* Documentation refinements

### 0.1.2 (Dec 6, 2013)

* Fixed an issue where default config would not load when globally installed

### 0.1.3 (Dec 8, 2013)

* Updates to reflect a refactor of dependent docker.io library that changed the way streams are handled.

### 0.1.4 (Dec 9, 2013)

* Reverted to docker.io v0.9.4

### 0.1.5 (Dec 11, 2013)

* Upgrade to docker.io v0.9.8 to resolve a variable scope issue causing bad data to be returned

### 0.1.6 (Dec 11, 2013)

* Added support to specify the Docker API version to target

### 0.2.0 (Jan 15, 2014)

* Upgraded `node-etcd` lib to support Etcd v2 API by default

### 0.3.0 (Jan 29, 2014)

* Updated port mapping discovery code to support docker v1.8 API
* Updated default docker API version to v1.8
* Updated all dependencies to their latest versions

Note: This release is required for Docker 0.6.5 and above.

### 0.3.1 (Jan 29, 2014)

* Resolved issue where container IDs were not always stored in short (12 char) form when originating from docker event stream.

### 0.3.2 (Feb 24, 2014)

* Better error handling for uncaught exceptions.
* Handle state where port mapping from docker can be null.

## 0.3.3 (Mar 25, 2014)

* Check for valid Etcd / Docker instances before starting.
* Updated README to reflect current configuration options.

## 0.4.0 (Apr 27, 2014)

* Listen to 'die' event instead of 'stop' event to remove service from registry
* Updated all dependencies to their latest versions

## 0.4.1 (July 30, 2014)

* Fixed bug where reconciliation would not happen if the host node did not exist in etcd
