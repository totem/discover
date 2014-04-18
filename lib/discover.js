/*!
 * Totem Discover
 * Copyright(c) 2013 Meltmedia <mike@meltmedia.com>
 * MIT Licensed
 */

/* jshint -W079 */

'use strict';

var winston = require('winston'),
    Etcd = require('node-etcd'),
    events = require('events'),
    util = require('util'),
    async = require('async'),
    Set = require('set'),
    Docker = require('./docker');

var SERVICE_PREFIX = 'service/',
    HOST_PREFIX = 'host/';


module.exports = Discover;


function Discover(config) {
  if (!(this instanceof Discover)) {
    return new Discover(config);
  }

  if (!config ||
      !config.host || !config.host.id || !config.host.realm ||
      !config.etcd || !config.etcd.prefix) {
    throw new Error('Invalid configuration, you must provide valid `host` and `etcd` configuration blocks');
  }

  var self = this;

  this.config = config;

  this.docker = new Docker(this.config);
  this.etcd = new Etcd(this.config.etcd.host, this.config.etcd.port);

  this.hostId = this.config.host.id;
  this.hostRealm = this.config.host.realm;

  this.servicePrefix = this.config.etcd.prefix + SERVICE_PREFIX;
  this.containerPrefix = this.config.etcd.prefix + HOST_PREFIX + this.hostId + '/';

  // Ensure we can connect to Etcd
  try {
    this.etcd.version(function (err, version) {
      if (err) {
        throw new Error('Error connecting to Etcd caused by: ' + err);
      }
      if (!version) {
        throw new Error('Unable to determine version of Etcd');
      }

      self.emit('connect');
      winston.log('debug', 'Etcd version: %s', JSON.stringify(version));
    });
  } catch (err) {
    winston.log('error', 'Unable to connect to Etcd due to: %s', err);
    throw new Error('Unable to connect to Etcd. Ensure your configuration correct.');
  }

}

// Make Discover an EventEmitter
util.inherits(Discover, events.EventEmitter);

Discover.prototype.start = function () {
  // Reconcile the current state of the Docker, ensuring we are adversiting valid services
  this.reconcile();

  // Listen for new events
  this.listen();

  this.emit('start');
};

Discover.prototype.reconcile = function () {
  var self = this;

  winston.info('Reconciling from previously running state...');

  async.parallel({
    runningContainers: function (done) {
      self.docker.runningContainers(function (err, containers) {
        done(err, containers);
      });
    },
    publishedContainers: function (done) {
      self.etcd.get(self.containerPrefix, function (err, result) {
        if(err) { return done(undefined, result); }
        done(null, result);
      });
    }
  }, function (err, results) {

    var running = new Set();
    if (results.runningContainers) {
      results.runningContainers.forEach(function (item) {
        running.add(item);
      });
    }

    var published = new Set();
    if (results.publishedContainers.node && results.publishedContainers.node.nodes) {
      results.publishedContainers.node.nodes.forEach(function (item) {
        var keyParts = item.key.split('/');
        published.add(keyParts[keyParts.length - 1]);
      });
    }

    var toUnpublish = published.find(function (item) {
      return !running.contains(item);
    });
    var toPublish = running.find(function (item) {
      return !published.contains(item);
    });

    if (toUnpublish.length > 0) {
      winston.info('Unpublishing: ' + toUnpublish + ' as they are no longer running');
      toUnpublish.forEach(function (id) {
        self.unpublish(id);
      });
    }

    if (toPublish.length > 0) {
      winston.info('Publishing: ' + toPublish + ' as they are running but not published');
      toPublish.forEach(function (id) {
        self.publish(id);
      });
    }
  });
};

Discover.prototype.listen = function () {
  var self = this;

  this.docker.events(function (err, event) {
    if (err) {
      // @todo: Something went wrong... can we recover from this?
      // @todo: Check for stream close and retry
      winston.error('Something went wrong streaming events from Docker due to: ' + err);
      return;
    }

    // No event found, so nothing to do
    if (!event) {
      return;
    }

    if (event.status === 'start') {
      try {
        self.publish(event.id);
      } catch (err) {
        winston.log('error', 'Unable to publish services initiated by event: %s due to uncaught exception: %s', event, err);
      }
    } else if (event.status === 'stop') {
      try {
        self.unpublish(event.id);
      } catch (err) {
        winston.log('error', 'Unable to unpublish services initiated by event: %s due to uncaught exception: %s', event, err);
      }
    }
  });
};

Discover.prototype.publish = function publish(containerId, cb) {
  var self = this;

  cb = cb || function () {};

  winston.debug('Publishing services for container: ' + containerId);

  self.docker.publishedServices(containerId, function (err, services) {
    if (err) {
      winston.warn('Unable to lookup container for id: ' + containerId + ' due to: ' + JSON.stringify(err));
      return cb(err);
    }

    var published = {};
    try {
      services.forEach(function (service) {
        var servicePath = self.servicePrefix + service.name + '/' + service.realm + '/' + self.hostId + '/' + service.containerId;
        winston.debug('Registering service: ' + service.name + ' at prefix: ' + servicePath + ' with value: ' + service.location);
        self.etcd.set(servicePath, service.location, function (err) {
          if (err) {
            winston.warn('Unable to register service at path: ' + servicePath + ' due to: ' + JSON.stringify(err));
            throw err;
          }
        });
        published[service.name] = servicePath;
      });
    } catch (e) {
      winston.error('Unable to publish services for container: ' + containerId + ' due to: ' + e.stack);
      return cb(e);
    }

    var containerPath = self.containerPrefix + containerId;
    self.etcd.set(containerPath, JSON.stringify(published), function (err) {
      if (err) {
        winston.warn('Unable to register container at path: ' + containerPath + ' due to: ' + JSON.stringify(err));
        return cb(err);
      }
      self.emit('publish', { id: containerId, services: published });
      cb(null, published);
    });

  });
};

Discover.prototype.unpublish = function unpublish(containerId, cb) {
  var self = this;

  cb = cb || function () {};

  winston.debug('Unpublishing services for container: ' + containerId);

  var containerPath = self.containerPrefix + containerId;
  self.etcd.get(containerPath, function (err, result) {
    if (err) {
      winston.warn('Unable to unpublish services for container: ' + containerId + ' at path: ' + containerPath + ' due to: ' + JSON.stringify(err));
      return cb(err);
    }

    if (!result || !result.node) {
      var msg = 'Unable to unpublish services for container: ' + containerId + ' as no entry was found for path: ' + containerPath;
      winston.warn(msg);
      return cb(new Error(msg));
    }

    var published;
    try {
      published = JSON.parse(result.node.value);
    } catch (e) {
      var msg = 'Unable to unpublish services for container: ' + containerId + ' as published payload will not parse due to: ' + e;
      winston.error(msg);
      return cb(new Error(msg));
    }

    var unpublished = {},
        services = Object.keys(published);

    try {
      services.forEach(function (service) {
        var servicePath = published[service],
            errors = [];
        self.etcd.del(servicePath, { recursive: true }, function (err) {
          if (err) {
            winston.error('Unable to remove registerd service at path: ' + servicePath + ' due to: ' + JSON.stringify(err));
            errors.push(err);
          }
        });

        // If we were unable to remove any services, we should fail with a list of all services that we could not remove.
        if (errors.length > 0) {
          throw errors;
        }

        unpublished[service] = servicePath;
      });
    } catch (e) {
      winston.error('Unable to unpublish services for container: ' + containerId + ' due to: ' + e);
      return cb(e);
    }

    self.etcd.del(containerPath, { recursive: true }, function (err) {
      if (err) {
        winston.warn('Unable to remove registerd container at path: ' + containerPath + ' due to: ' + JSON.stringify(err));
        return cb(err);
      }
      self.emit('unpublish', { id: containerId, services: unpublished });
      cb(null, unpublished);
    });

  });
};
