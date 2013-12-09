'use strict';

var events = require('events');

var START_EVENT = module.exports.START_EVENT = {
  status: 'start',
  id: 'started-container',
  from: 'base:latest',
  time: 1374067924
};

var STOP_EVENT = module.exports.STOP_EVENT = {
  status: 'stop',
  id: 'started-container',
  from: 'base:latest',
  time: 1374067924
};

var CONTAINER_START = module.exports.CONTAINER_START = {
  "ID": "ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217",
  "Created": "2013-11-19T23:04:03.962096474-07:00",
  "Path": "/usr/bin/static",
  "Args": [
    "/opt/dashboard/dist"
  ],
  "Config": {
    "Hostname": "ae99418bd71b",
    "Domainname": "",
    "User": "",
    "Memory": 0,
    "MemorySwap": 0,
    "CpuShares": 0,
    "AttachStdin": false,
    "AttachStdout": false,
    "AttachStderr": false,
    "PortSpecs": [
      "8080",
      "8081"
    ],
    "Tty": false,
    "OpenStdin": false,
    "StdinOnce": false,
    "Env": [
      "HOME=/",
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "DISCOVER=service1:8080, service2:8081/udp"
    ],
    "Cmd": [
      "/opt/dashboard/dist"
    ],
    "Dns": [
      "8.8.8.8",
      "8.8.4.4"
    ],
    "Image": "dashboard",
    "Volumes": null,
    "VolumesFrom": "",
    "WorkingDir": "",
    "Entrypoint": [
      "/usr/bin/static"
    ],
    "NetworkDisabled": false,
    "Privileged": false
  },
  "State": {
    "Running": true,
    "Pid": 15854,
    "ExitCode": 0,
    "StartedAt": "2013-11-25T17:02:42.86165125-07:00",
    "Ghost": false
  },
  "Image": "bd9950c711529c142ea81fd192b8d939feba68fb217dc6d105f9952e95a26cf7",
  "NetworkSettings": {
    "IPAddress": "172.17.0.6",
    "IPPrefixLen": 16,
    "Gateway": "172.17.42.1",
    "Bridge": "docker0",
    "PortMapping": {
      "Tcp": {
        "8080": "49157"
      },
      "Udp": {
        "8081": "49158"
      }
    }
  },
  "SysInitPath": "/usr/bin/docker",
  "ResolvConfPath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/resolv.conf",
  "HostnamePath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/hostname",
  "HostsPath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/hosts",
  "Volumes": {},
  "VolumesRW": {}
};

var CONTAINER_STOP = module.exports.CONTAINER_STOP = {
  "ID": "ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217",
  "Created": "2013-11-09T01:02:11.249861503-07:00",
  "Path": "/usr/bin/static",
  "Args": [
    "/opt/dashboard/dist"
  ],
  "Config": {
    "Hostname": "ae99418bd71b",
    "Domainname": "",
    "User": "",
    "Memory": 0,
    "MemorySwap": 0,
    "CpuShares": 0,
    "AttachStdin": false,
    "AttachStdout": false,
    "AttachStderr": false,
    "PortSpecs": [
      "8080"
    ],
    "Tty": false,
    "OpenStdin": false,
    "StdinOnce": false,
    "Env": [
      "HOME=/",
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "DISCOVER=service1:8080, service2:8081/udp"
    ],
    "Cmd": [
      "/opt/dashboard/dist"
    ],
    "Dns": null,
    "Image": "dashboard",
    "Volumes": null,
    "VolumesFrom": "",
    "WorkingDir": "",
    "Entrypoint": [
      "/usr/bin/static"
    ],
    "NetworkDisabled": false,
    "Privileged": false
  },
  "State": {
    "Running": false,
    "Pid": 0,
    "ExitCode": 143,
    "StartedAt": "2013-11-25T17:02:24.305780502-07:00",
    "Ghost": false
  },
  "Image": "bd9950c711529c142ea81fd192b8d939feba68fb217dc6d105f9952e95a26cf7",
  "NetworkSettings": {
    "IPAddress": "",
    "IPPrefixLen": 0,
    "Gateway": "",
    "Bridge": "",
    "PortMapping": null
  },
  "SysInitPath": "/usr/bin/docker",
  "ResolvConfPath": "/var/lib/docker/containers/ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217/resolv.conf",
  "HostnamePath": "/var/lib/docker/containers/ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217/hostname",
  "HostsPath": "/var/lib/docker/containers/ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217/hosts",
  "Volumes": {},
  "VolumesRW": {}
};

var CONTAINER_MALFORMED = module.exports.CONTAINER_MALFORMED = {
  "ID": "ae99418bd71ba9700b4d3ae89e4afa66d240524ad3cbf407c8db44a618031217",
  "Created": "2013-11-19T23:04:03.962096474-07:00",
  "Path": "/usr/bin/static",
  "Args": [
    "/opt/dashboard/dist"
  ],
  "Config": {
    "Hostname": "ae99418bd71b",
    "Domainname": "",
    "User": "",
    "Memory": 0,
    "MemorySwap": 0,
    "CpuShares": 0,
    "AttachStdin": false,
    "AttachStdout": false,
    "AttachStderr": false,
    "PortSpecs": [
      "8080",
      "8081"
    ],
    "Tty": false,
    "OpenStdin": false,
    "StdinOnce": false,
    "Env": [
      "HOME=/",
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "DISCOVER=,,/"
    ],
    "Cmd": [
      "/opt/dashboard/dist"
    ],
    "Dns": [
      "8.8.8.8",
      "8.8.4.4"
    ],
    "Image": "dashboard",
    "Volumes": null,
    "VolumesFrom": "",
    "WorkingDir": "",
    "Entrypoint": [
      "/usr/bin/static"
    ],
    "NetworkDisabled": false,
    "Privileged": false
  },
  "State": {
    "Running": true,
    "Pid": 15854,
    "ExitCode": 0,
    "StartedAt": "2013-11-25T17:02:42.86165125-07:00",
    "Ghost": false
  },
  "Image": "bd9950c711529c142ea81fd192b8d939feba68fb217dc6d105f9952e95a26cf7",
  "NetworkSettings": {
    "IPAddress": "172.17.0.6",
    "IPPrefixLen": 16,
    "Gateway": "172.17.42.1",
    "Bridge": "docker0",
    "PortMapping": {
      "Tcp": {
        "8080": "49157"
      },
      "Udp": {
        "8081": "49158"
      }
    }
  },
  "SysInitPath": "/usr/bin/docker",
  "ResolvConfPath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/resolv.conf",
  "HostnamePath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/hostname",
  "HostsPath": "/var/lib/docker/containers/68c34a83fd89907d9602088bdcbbbf8543ba0f006e4f228597f707e372232674/hosts",
  "Volumes": {},
  "VolumesRW": {}
};

var CONTAINER_LIST = module.exports.CONTAINER_LIST = [
  {
    "Id": "started-container",
    "Image": "dashboard",
    "Command": "/opt/dashboard/dist",
    "Created": 1367854155,
    "Status": "Exit 0",
    "Ports":[
      {"PrivatePort": 8080, "PublicPort": 49157, "Type": "tcp"},
      {"PrivatePort": 8081, "PublicPort": 49158, "Type": "udp"}
    ],
    "SizeRw":0,
    "SizeRootFs":0
  }
];

module.exports.validMock = function (config) {
  var client = {
    version: function (cb) {
      cb(null, { version: 'mock docker' });
    },
    'events': function (cb) {
      var emitter = new events.EventEmitter();
      var eventStr = JSON.stringify(START_EVENT);
      cb(null, emitter);
      emitter.emit('data', eventStr);
    },
    containers: {
      list: function (cb) {
        cb(null, CONTAINER_LIST);
      },
      inspect: function (id, cb) {
        switch (id) {
          case 'started-container':
            cb(null, CONTAINER_START);
            break;
          case 'stopped-container':
            cb(null, CONTAINER_STOP);
            break;
          default:
            cb(new Error('invalid container'));
            break;
        };
      }        
    }
  };

  return client;
};

module.exports.validEventMock = function (config) {
  var client = {
    version: function (cb) {
      cb(null, { version: 'mock docker' });
    },
    'events': function (cb) {
      var emitter = new events.EventEmitter();
      cb(null, emitter);

      emitter.emit('data', null);

      var eventStr = JSON.stringify(START_EVENT);
      emitter.emit('data', eventStr);

      eventStr = JSON.stringify(STOP_EVENT);
      emitter.emit('data', eventStr);
    },
    containers: {
      list: function (cb) {
        cb(null, CONTAINER_LIST);
      },
      inspect: function (id, cb) {
        switch (id) {
          case 'started-container':
            cb(null, CONTAINER_START);
            break;
          case 'stopped-container':
            cb(null, CONTAINER_STOP);
            break;
          default:
            cb(new Error('invalid container'));
            break;
        };
      }        
    }
  };

  return client;
};

module.exports.reconcileUnpublishMock = function (config) {
  var client = {
    version: function (cb) {
      cb(null, { version: 'mock docker' });
    },
    'events': function (cb) {
      var emitter = new events.EventEmitter();
      var eventStr = JSON.stringify(START_EVENT);
      cb(null, emitter);
      emitter.emit('data', eventStr);
    },
    containers: {
      list: function (cb) {
        cb(null, []);
      },
      inspect: function (id, cb) {
        switch (id) {
          case 'started-container':
            cb(null, CONTAINER_START);
            break;
          case 'stopped-container':
            cb(null, CONTAINER_STOP);
            break;
          default:
            cb(new Error('invalid container'));
            break;
        };
      }        
    }
  };

  return client;
};

module.exports.erroredMock = function (config) {
  var client = {
    version: function (cb) {
      cb(null, { version: 'mock docker' });
    },
    'events': function (cb) {
      cb(new Error('event stream error'));
    },
    containers: {
      list: function (cb) {
        cb(new Error('container list error'));
      },
      inspect: function (id, cb) {
        cb(new Error('container inspect error'));
      }        
    }
  };

  return client;
};

module.exports.malformedMock = function (config) {
  var client = {
    version: function (cb) {
      cb(null, { version: 'mock docker' });
    },
    'events': function (cb) {
      var emitter = new events.EventEmitter();
      var eventStr = '{[]';
      cb(null, emitter);
      emitter.emit('data', eventStr);
    },
    containers: {
      list: function (cb) {
        cb(null, CONTAINER_LIST);
      },
      inspect: function (id, cb) {
        switch (id) {
          case 'malformed-container':
            cb(null, CONTAINER_MALFORMED);
            break;
        };
      }        
    }
  };

  return client;
};
