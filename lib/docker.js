/*!
 * Totem Discover
 * Copyright(c) 2013 Meltmedia <mike@meltmedia.com>
 * MIT Licensed
 */

'use strict';

var winston = require('winston'),
    dockerClient = require('docker.io'),
    events = require('events'),
    util = require('util');


module.exports = Docker;


function Docker(config) {
  if (!(this instanceof Docker)) {
    return new Docker(config);
  }

  if (!config ||
      !config.host || !config.host.ip || !config.host.realm ||
      !config.docker) {
    throw new Error('Invalid configuration, you must provide valid `host` and `docker` configuration blocks');
  }

  var self = this;

  this.config = config;

  this.docker = dockerClient(this.config.docker);

  this.serviceVariableMatcher = new RegExp('^' + this.config.discover.serviceVariable + '=(.*)$');

  // Setup host specific configuration
  this.hostIp = this.config.host.ip;
  this.hostRealm = this.config.host.realm;

  this.docker.version(function (err, res) {
    self.emit('connect');
    winston.debug('Docker version: ' + JSON.stringify(res));
  });
}

// Make Docker an EventEmitter
util.inherits(Docker, events.EventEmitter);

Docker.prototype.events = function (cb) {
  this.docker.events(function (err, res) {
    if (err) {
      winston.error('An error occured streaming events from Docker: ' + err);
      return cb(err);
    }

    res.on('data', function (event) {
      var parsedEvent;
      try {
        parsedEvent = JSON.parse(event);
        // Trim the id if needed
        parsedEvent.id = (parsedEvent.id.length > 12) ? parsedEvent.id.slice(0, 12) : parsedEvent.id;

        winston.debug('Docker event: ' + parsedEvent.status + ' - ' + parsedEvent.id + ' - ' + parsedEvent.from);
      } catch (e) {
        var message = 'Unable to parse Docker event: ' + util.inspect(event, {depth: 4, colors: true}) + ' due to: ' + e;
        winston.warn(message);
        return cb(new Error(message));
      }

      cb(null, parsedEvent);
    });

    res.on('end', function () {
      cb(new Error('Docker event stream closed'));
    });
  });
};

Docker.prototype.runningContainers = function (cb) {
  this.docker.containers.list(function (err, containers) {
    if (err) {
      winston.error('An error occured getting container list from Docker: ' + err);
      return cb(err);
    }

    var containerIds = [];
    if (containers) {
      containers.forEach(function (item) {
        var id = (item.Id.length === 64) ? item.Id.slice(0, 12) : item.Id;
        containerIds.push(id);
      });
    }

    cb(err, containerIds);
  });
};

Docker.prototype.publishedServices = function (id, cb) {
  var self = this;

  this.docker.containers.inspect(id, function (err, container) {
    var services = [];

    if (err) {
      winston.error('Unable to lookup published services for container due to: ' + err);
      return cb(err);
    }

    if (!container) {
      err = 'Unable to find container for id: ' + id;
      winston.warn(err);
      return cb(new Error(err));
    }

    if (!container.State.Running) {
      err = 'Unable to lookup published services for containers that are not running';
      winston.warn(err);
      return cb(new Error(err));
    }

    winston.log('silly', 'Container: ' + JSON.stringify(container, null, '  '));

    // Look for the 'DISCOVER' environment variable of published services
    if (container.Config && container.Config.Env) {
      container.Config.Env.forEach(function (env) {
        if (env.match(self.serviceVariableMatcher)) {
          var serviceDescriptors = env.replace(self.serviceVariableMatcher, '$1').split(',');

          var portMappings = {};
          if (container.NetworkSettings.Ports) {

            Object.keys(container.NetworkSettings.Ports).forEach(function (key) {
              // A private port can be mapped to many interfaces on the host machine.
              // We look for a mapping for 0.0.0.0, indicating it's bound to all interfaces.
              // This ensures a mapping we add to the service registry can be routed to from the outside world.

              if (!container.NetworkSettings.Ports[key]) {
                return;
              }

              container.NetworkSettings.Ports[key].some(function (exposedMapping) {
                portMappings[key] = exposedMapping.HostPort;
              });
            });
          }

          serviceDescriptors.forEach(function (item) {
            try {
              var parts = item.trim().split(':'),
                  name = parts[0],
                  port = parts[1],
                  protocol = 'tcp',
                  location = null;

              // port definition can include the protocol in the form of '<port>/<protocol>' such as '8125/udp'
              if (port.indexOf('/') >= 0) {
                var portParts = port.split('/');
                port = portParts[0];
                protocol = portParts[1].toLowerCase();
              }

              var publicPort = portMappings[port + '/' + protocol];

              // Only set a location for the service if we know the ip:port
              if (container.NetworkSettings.IPAddress && publicPort) {
                location = protocol + '://' + container.NetworkSettings.IPAddress + ':' + publicPort;
              }

              // Publish the service if we were able to discover it's location
              if (location) {
                services.push({
                  name: name,
                  containerId: id,
                  location: location,
                  realm: self.hostRealm
                });
              } else {
                throw new Error('cant find running service:', name);
              }

            } catch (e) {
              // @todo: should we silently ignore this?
              var message = 'There was an issue discovering services for: ' + id + ' with service descriptor: ' + item + ' due to: ' + e;
              winston.error(message);
            }
          });

        }
      });
    }
    cb(null, services);
  });
};
