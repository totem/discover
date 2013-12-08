#!/usr/bin/env node

/* jshint -W098 */

/*!
 * Totem Discover
 * Copyright(c) 2013 Meltmedia <mike@meltmedia.com>
 * MIT Licensed
 */

'use strict';


var winston = require('winston'),
    os = require('os'),
    path = require('path'),
    request = require('request'),
    async = require('async'),
    Discover = require('./lib/discover');

// Remove console transport until we know we are run from the CLI
winston.remove(winston.transports.Console);

/**
 * Discover CLI
 */
function main() {

  var nconf = require('nconf');

  //
  // Setup nconf to use (in-order):
  //   1. Command-line arguments
  //   2. Environment variables
  //   2. Custom config file
  //   2. Defaults
  //
  nconf
    .argv()
    .env('_');

  // Load custom config file
  if (nconf.get('config')) {
    nconf.use('file', { file: nconf.get('config') });
  }

  // Last case scenerio, we set sane defaults
  nconf.use('file', { file: path.join(__dirname, 'config/defaults.json') });

  // Configure log destinations
  if (nconf.get('log')) {
    winston.add(winston.transports.File, { timestamp: true, filename: nconf.get('log') });
  } else {
    winston.add(winston.transports.Console);
    winston.cli();
  }

  if (nconf.get('debug')) {
    winston.level = 'debug';
  }

  console.log('   ___  _                         '.cyan);
  console.log('  / _ \\(_)__ _______ _  _____ ____'.cyan);
  console.log(' / // / (_-</ __/ _ \\ |/ / -_) __/'.cyan);
  console.log('/____/_/___/\\__/\\___/___/\\__/_/   '.cyan);

  try {
  
    configure(function (err, config) {
      if (err) {
        throw err;
      }

      winston.debug('Starting discover...');
      var discover = new Discover(config);
      discover.start();
    });

  } catch (err) {
    winston.error('Failed to start due to: ' + err);
    process.exit(1);
  }

  // Build application configuration from explicit and implicit sources
  function configure(cb) {
    winston.debug('Configuring discover...');
    async.parallel(
      {
        discover: function configureDiscover(config) {
          config(null, {
            serviceVariable: nconf.get('discover:serviceVariable') || 'DISCOVER'
          });
        },
        docker: function configureDocker(config) {
          config(null, {
            socketPath: nconf.get('docker:socketPath'),
            host: nconf.get('docker:host'),
            port: nconf.get('docker:port')
          });
        },
        etcd: function configureEtcd(config) {
          config(null, {
            host: nconf.get('etcd:host'),
            port: nconf.get('etcd:port'),
            prefix: nconf.get('etcd:prefix')
          });
        },
        host: function configureHost(config) {

          var hostIp = '127.0.0.1', // Default host IP if we can't find one in network interfaces
              hostId = os.hostname(); // Default host name if not explicitly configured

          async.parallel([

            function (done) {
              // Get instance ID from AWS for host ID
              request({ url: 'http://169.254.169.254/latest/meta-data/instance-id', timeout: 2000 }, function (err, res, body) {
                if (!err && body) {
                  hostId = body;
                }
                done();
              });
            },

            function (done) {
              // Get the host IP address from the public interface
              var interfaces = os.networkInterfaces()['eth0'];
              if (interfaces) {
                interfaces.forEach(function (item) {
                  if (item.family === 'IPv4') {
                    hostIp = item.address;
                  }
                });
              }
              done();
            }

          ], function () {
            config(null, {
              ip: nconf.get('host:ip') || hostIp,
              realm: nconf.get('host:realm'),
              id: nconf.get('host:id') || hostId
            });
          });
        }
      },
      function (err, config) {
        if (err) {
          winston.error('Unable to configure Discover due to: ' + err);
          return cb(err);
        }
        winston.debug('Configuring discover complete: ' + JSON.stringify(config, null, '  '));
        cb(null, config);
      }
    );
  }
}

if (require.main === module) {
  main();
}
