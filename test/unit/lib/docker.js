'use strict';

var chai = require('chai'),
    rewire = require('rewire'),
    expect = chai.expect,
    dockerMock = require('../../mock/docker-io');

var VALID_CONFIG = {
  discover: {
    serviceVariable: 'DISCOVER'
  },
  docker: {
    socketPath: false
  },
  host: {
    ip: '127.0.0.1',
    realm: 'test'
  }
};

var INVALID_CONFIG = {};

describe('Docker', function () {

  // rewire acts exactly like require.
  var DockerModule = rewire('../../../lib/docker');

  function dockerInstance(type) {
    switch (type) {
      case 'errored':
        DockerModule.__set__('dockerClient', dockerMock.erroredMock);
        break;
      case 'malformed':
        DockerModule.__set__('dockerClient', dockerMock.malformedMock);
        break;
      default:
        DockerModule.__set__('dockerClient', dockerMock.validMock);
    }
    return DockerModule.__get__('Docker');
  }

  describe('Docker()', function () {
    it('should create a new Docker instance using valid configuration', function (done) {
      var Docker = dockerInstance(),
          docker = Docker(VALID_CONFIG);
      expect(docker.config).to.deep.equal(VALID_CONFIG);
      done();
    });

    it('should create a new Docker instance using invalid configuration', function (done) {
      try {
        var Docker = dockerInstance(),
            docker = new Docker(INVALID_CONFIG);
      } catch (err) {
        expect(err).to.exist;
      }
      done();
    });
  });

  describe('#events()', function () {
    it('should call the events() method, returning a valid event', function (done) {
      var Docker = dockerInstance(),
          docker = new Docker(VALID_CONFIG);
      docker.events(function (err, e) {
        expect(err).to.not.exist;
        expect(e).to.deep.equal(dockerMock.START_EVENT);
        done();
      });
    });

    it('should call the events() method, returning an event that won\'t parse', function (done) {
      var Docker = dockerInstance('malformed'),
          docker = new Docker(VALID_CONFIG);
      docker.events(function (err, e) {
        expect(err).to.exist;
        expect(e).to.not.exist;
        done();
      });
    });

    it('should call the events() method, returning an error', function (done) {
      var Docker = dockerInstance('errored'),
          docker = new Docker(VALID_CONFIG);
      docker.events(function (err, e) {
        expect(err).to.exist;
        expect(e).to.not.exist;
        done();
      });
    });
  });

  describe('#runningContainers()', function () {
    it('should call the runningContainers() method, returning a single running container', function (done) {
      var Docker = dockerInstance(),
          docker = new Docker(VALID_CONFIG);
      docker.runningContainers(function (err, list) {
        expect(err).to.not.exist;
        expect(list).to.have.length(1);
        done();
      });
    });

    it('should call the runningContainers() method, returning an error', function (done) {
      var Docker = dockerInstance('errored'),
          docker = new Docker(VALID_CONFIG);
      docker.runningContainers(function (err, list) {
        expect(err).to.exist;
        expect(list).to.not.exist;
        done();
      });
    });
  });

  describe('#publishedServices()', function () {
    it('should call the publishedServices() with started container id, returning a list of services', function (done) {
      var Docker = dockerInstance(),
          docker = new Docker(VALID_CONFIG);
      docker.publishedServices('started-id-1', function (err, services) {
        expect(err).to.not.exist;
        expect(services).to.have.length(2);
        done();
      });
    });

    it('should call the publishedServices() with stopped container id, returning an error', function (done) {
      var Docker = dockerInstance(),
          docker = new Docker(VALID_CONFIG);
      docker.publishedServices('stopped-id-1', function (err, services) {
        expect(err).to.exist;
        expect(services).to.not.exist;
        done();
      });
    });

    it('should call the publishedServices() with container id with malformed service definitions, returning an error', function (done) {
      var Docker = dockerInstance('malformed'),
          docker = new Docker(VALID_CONFIG);
      docker.publishedServices('malform-id-1', function (err, services) {
        expect(err).to.not.exist;
        expect(services).to.have.length(0);
        done();
      });
    });

    it('should call the publishedServices() with valid container id, returning an error', function (done) {
      var Docker = dockerInstance('errored'),
          docker = new Docker(VALID_CONFIG);
      docker.publishedServices('started-id-1', function (err, services) {
        expect(err).to.exist;
        expect(services).to.not.exist;
        done();
      });
    });
  });


});
