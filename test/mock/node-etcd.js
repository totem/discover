'use strict';

var VALID_STARTED_HOSTS_PAYLOAD = {
  "action": "get",
  "node": {
    "createdIndex": 50,
    "dir": true,
    "key": "/unit-test/host/test-host",
    "modifiedIndex": 50,
    "nodes": [{
      "createdIndex": 1,
      "modifiedIndex": 1,
      "key": "/unit-test/host/test-host/started-container",
      "value": "{\"service1\":\"/unit-test/service/service1/test-realm/test-host/started-container\",\"service2\":\"/unit-test/service/service2/test-realm/test-host/started-container\"}"
    }]
  }
}

var VALID_HOST_PAYLOAD = {
  "action": "get",
  "node": {
    "createdIndex": 1,
    "modifiedIndex": 1,
    "key": "/unit-test/host/test-host/started-container",
    "value": "{\"service1\":\"/unit-test/service/service1/test-realm/test-host/started-container\",\"service2\":\"/unit-test/service/service2/test-realm/test-host/started-container\"}"
  }
}

var INVALID_HOST_PAYLOAD = {
  "action": "get",
  "node": {
    "createdIndex": 1,
    "modifiedIndex": 1,
    "key": "/unit-test/host/test-host/started-container",
    "value": "[{]}"
  }
};

module.exports.validMock = function (host, port) {
  var client = {
    get: function (key, cb) {
      switch (key) {
        case '/unit-test/host/test-host/started-container':
          cb(null, VALID_HOST_PAYLOAD);
          break;
        case '/unit-test/host/test-host/':
          cb(null, VALID_STARTED_HOSTS_PAYLOAD);
          break;
        default:
          cb(new Error('invalid key'));
      };
    },
    set: function (key, value, cb) {
      cb(null);
    },
    del: function (key, opt, cb) {
      cb(null);
    }
  };

  return client;
};

module.exports.reconcilePublishMock = function (host, port) {
  var client = {
    get: function (key, cb) {
      switch (key) {
        case '/unit-test/host/test-host/started-container':
          cb(null, VALID_HOST_PAYLOAD);
          break;
        case '/unit-test/host/test-host/':
          cb(null, []);
          break;
        default:
          cb(new Error('invalid key'));
      };
    },
    set: function (key, value, cb) {
      cb(null);
    },
    del: function (key, opt, cb) {
      cb(null);
    }
  };

  return client;
};

module.exports.erroredGetSetMock = function (host, port) {
  var client = {
    get: function (key, cb) {
      cb(new Error('get error'));
    },
    set: function (key, value, cb) {
      cb(new Error('set error'));
    },
    del: function (key, opt, cb) {
      cb(new Error('delete error'));
    }
  };

  return client;
};

module.exports.erroredDelMock = function (host, port) {
  var client = {
    get: function (key, cb) {
      switch (key) {
        case '/unit-test/host/test-host/started-container':
          cb(null, VALID_HOST_PAYLOAD);
          break;
        default:
          cb(new Error('invalid key'));
      };
    },
    set: function (key, value, cb) {
      cb(new Error('set error'));
    },
    del: function (key, opt, cb) {
      cb(new Error('delete error'));
    }
  };

  return client;
};

module.exports.malformedMock = function (host, port) {
  var client = {
    get: function (key, cb) {
      switch (key) {
        case '/unit-test/host/test-host/started-container':
          cb(null, INVALID_HOST_PAYLOAD);
          break;
        default:
          cb(new Error('invalid key'));
      };
    },
    set: function (key, value, cb) {
      cb(null);
    },
    del: function (key, opt, cb) {
      cb(null);
    }
  };

  return client;};
