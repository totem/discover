'use strict';

var chai = require('chai'),
    rewire = require('rewire'),
    expect = chai.expect,
    dockerMock = require('../../mock/docker-io'),
    etcdMock = require('../../mock/node-etcd');

var VALID_CONFIG = {
  discover: {
    serviceVariable: 'DISCOVER'
  },
  docker: {
    socketPath: false
  },
  etcd: {
    host: '127.0.0.1',
    port: 4001,
    prefix: '/unit-test/'
  },
  host: {
    ip: '127.0.0.1',
    realm: 'test-realm',
    id: 'test-host'
  }
};

var INVALID_CONFIG = {};

describe('Discover', function () {

  var DockerModule = rewire('../../../lib/docker'),
      DiscoverModule = rewire('../../../lib/discover');

  function discoverInstance(type) {
    switch (type) {
      case 'erroredGetSet':
        DockerModule.__set__('dockerClient', dockerMock.validMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.erroredGetSetMock);
        break;
      case 'erroredDel':
        DockerModule.__set__('dockerClient', dockerMock.validMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.erroredDelMock);
        break;
      case 'malformed':
        DockerModule.__set__('dockerClient', dockerMock.validMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.malformedMock);
        break;
      case 'reconcilePublish':
        DockerModule.__set__('dockerClient', dockerMock.validMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.reconcilePublishMock);
        break;
      case 'reconcileUnpublish':
        DockerModule.__set__('dockerClient', dockerMock.reconcileUnpublishMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.validMock);
        break;
      default:
        DockerModule.__set__('dockerClient', dockerMock.validEventMock);
        var Docker = DockerModule.__get__('Docker');
        DiscoverModule.__set__('Docker', Docker);
        DiscoverModule.__set__('Etcd', etcdMock.validMock);
    }
    return DiscoverModule.__get__('Discover');
  }

  describe('Discover()', function () {
    it('should create a new Discover instance using valid configuration', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);
      expect(discover.config).to.deep.equal(VALID_CONFIG);
      done();
    });

    it('should create a new Discover instance using invalid configuration', function (done) {
      try {
        var Discover = discoverInstance(),
            discover = Discover(INVALID_CONFIG);
      } catch (err) {
        expect(err).to.exist;
      }
      done();
    });
  });

  describe('#publish()', function () {
    it('should publish the exposed services of a running Docker contianer to Etcd', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.publish('started-container', function (err, published) {
        expect(err).to.not.exist;
        expect(published).to.exist;
        expect(published).to.have.property('service1');
        expect(published).to.have.property('service2');
        done();
      });
    });

    it('should return an error attempting to publish the exposed services of a stopped Docker contianer', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.publish('stopped-container', function (err, published) {
        expect(err).to.exist;
        expect(published).to.not.exist;
        done();
      });
    });

    it('should return an error attempting to publish the services of a Docker contianer that does not exist', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.publish('invalid-container', function (err, published) {
        expect(err).to.exist;
        expect(published).to.not.exist;
        done();
      });
    });

    it('should return an error attempting to publish services when etcd is unable to complete the transaction', function (done) {
      var Discover = discoverInstance('erroredGetSet'),
          discover = Discover(VALID_CONFIG);

      discover.publish('started-container', function (err, published) {
        expect(err).to.exist;
        expect(published).to.not.exist;
        done();
      });
    });

  });

  describe('#unpublish()', function () {
    it('should unpublish the exposed services of a previously published Docker contianer from Etcd', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.unpublish('started-container', function (err, unpublished) {
        expect(err).to.not.exist;
        expect(unpublished).to.exist;
        expect(unpublished).to.have.property('service1');
        expect(unpublished).to.have.property('service2');
        done();
      });
    });

    it('should return an error attempting to unpublish the services of a Docker contianer that never existed', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.unpublish('invalid-container', function (err, unpublished) {
        expect(err).to.exist;
        expect(unpublished).to.not.exist;
        done();
      });
    });

    it('should return an error attempting to unpublish the services of a Docker contianer with an invalid registration payload', function (done) {
      var Discover = discoverInstance('malformed'),
          discover = Discover(VALID_CONFIG);

      discover.unpublish('started-container', function (err, unpublished) {
        expect(err).to.exist;
        expect(unpublished).to.not.exist;
        done();
      });
    });

    it('should return an error attempting to unpublish services when etcd is unable to remove individual published services', function (done) {
      var Discover = discoverInstance('erroredDel'),
          discover = Discover(VALID_CONFIG);

      discover.unpublish('started-container', function (err, unpublished) {
        expect(err).to.exist;
        expect(unpublished).to.not.exist;
        done();
      });
    });

  });

  describe('#listen()', function () {
    it('should listen for container start events from Docker and publish services exposed by container', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.on('publish', function (data) {
        expect(data).to.exist;
        expect(data.id).to.equal('started-container');
        expect(data.services).to.have.property('service1');
        expect(data.services).to.have.property('service2');
        done();
      });

      discover.listen();
    });

    it('should listen for container stop events from Docker and unpublish services exposed by container', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.on('unpublish', function (data) {
        expect(data).to.exist;
        expect(data.id).to.equal('started-container');
        expect(data.services).to.have.property('service1');
        expect(data.services).to.have.property('service2');
        done();
      });

      discover.listen();
    });
  });

  describe('#reconcile()', function () {
    it('should reconcile the started vs. published list, finding one containers services to publish', function (done) {
      var Discover = discoverInstance('reconcilePublish'),
          discover = Discover(VALID_CONFIG);

      discover.on('publish', function (data) {
        expect(data).to.exist;
        expect(data.id).to.equal('started-container');
        expect(data.services).to.have.property('service1');
        expect(data.services).to.have.property('service2');
        done();
      });

      discover.reconcile();
    });

    it('should reconcile the started vs. published list, finding one containers services to unpublish', function (done) {
      var Discover = discoverInstance('reconcileUnpublish'),
          discover = Discover(VALID_CONFIG);

      discover.on('unpublish', function (data) {
        expect(data).to.exist;
        expect(data.id).to.equal('started-container');
        expect(data.services).to.have.property('service1');
        expect(data.services).to.have.property('service2');
        done();
      });

      discover.reconcile();
    });

  });

  describe('#start()', function () {
    it('should start by first reconciling, then listening for new Docker events', function (done) {
      var Discover = discoverInstance(),
          discover = Discover(VALID_CONFIG);

      discover.on('start', function () {
        done();
      });

      discover.start();
    });
  });

});
