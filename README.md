Discover: Docker Service Discovery
========

[![Build Status](https://travis-ci.org/totem/discover.png?branch=master)](https://travis-ci.org/totem/discover)

This service watches [Docker](http://docker.io) for containers starting and stopping to publish any advertised services out to [Etcd](https://github.com/coreos/etcd). At this time, consumption of the published services can be done by querying Etcd directly. There are however plans to develop client libraries making this trivial.

THe discovery of services is done by inspecting a custom ENV variable defined in the Dockerfile of the container. The ENV variable describes the service names and local ports they can be found on. Discover translates these to the public IP / Port assigned by Docker.

## How It Works

Discover uses Etcd, a REST based highly-available key/value store, as it's service registry. The best way to understand what Discover does is by walking through the lifecycle of a Docker container start/stop event. *Note: This example assumes you already have Etcd and Discover running and properly configured.*

### Container Configuration

Given the following `Dockerfile` that has been build using `docker build -t static-web-server`:

```
FROM totem/ubuntu:raring
RUN apt-get update --fix-missing && apt-get upgrade -y
RUN apt-get install -y wget curl build-essential patch git-core openssl libssl-dev unzip
RUN curl http://nodejs.org/dist/v0.10.20/node-v0.10.20-linux-x64.tar.gz | tar xzvf - --strip-components=1 -C "/usr"
RUN apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/*
RUN npm install -g node-static

ENV DISCOVER static-web-server:8080

ENTRYPOINT ['static']
```

### Service Discovery and Publication

Upon starting the container using `docker run -d -p 8080 static-web-server`, Docker will emit a start event for this container. Discover will listen for this event. Upon receiving the event, Discover will inspect the started container looking for a ENV variable matching the value of the `discover:serviceVariable` configuration variable. By default, this value will be `DISCOVER`.

In the case of our example, this ENV variable is set to `static-web-server:8080`. Discover will read this value and determine that the container that just started is exposing a service named `static-web-server` and it can be found on the private container port of 8080. *Note: by default tcp is assumed, however you can explcitly specify if the port is expecting tcp or udp.*

Now that Discover knows the service name and port, it will register the service with Etcd at the following location:

```
/<prefix>/service/static-web-server/<realm>/<host>/<container-id>
```

Where:

- `<prefix>`: Defined in the configuration of Discover. By default this is `/discover`.
- `<realm>`: Defined in the configuration of Discover. Used to segment services into logical groups.
- `<host>`: Identifier of the host this service was deployed on. This is determined using a strategy of a custom configuration value, then the AWS instance-id if availalbe, and lastly falling back to the hostname of the machine.
- `<container-id>`: This is the short 12 byte Docker container ID hosting the service.

The value stored at the above path will look like:
```
<protocol>://<public-ip-address>:<public-port>
```

Where:

- `<protocol>`: The protocol expected at the IP/Port. Valid values are `tcp` or `udp`.
- `<public-ip-address>`: The publicly routable IP address for the host machine.
- `<public-port>`: The port assigned by Docker that maps to the internal port defined by the service.

### Multiple Service Lookup

Since multiple services can be publicized under the same name, you can lookup all available services by broadaining the path you query. For example, a `GET /discover/service/static-web-server/my-realm?recursive=true` will return a list of all services with the name `static-web-server` that have been published in the realm `my-realm`.

## Publishing Services

Publishing services from a Docker container using Discover is simple. Simply define each service in the appropriate ENV variable, seperated by commas.

For example, to publish two services from a single container where `service1` is listening on 8080/tcp and `service2` is listening on 8125/udp you would specify the following ENV variable in your Dockerfile:

```
ENV DISCOVER service1:8080, service2:8125/udp
```

## Configuration

The following configuration options are available:

- `config`: path to JSON file defining custom configuration
- `discover`
  - `serviceVariable`: name of the ENV variable to inspect in started containers for published services. Default: DISCOVER
- `docker`
  - `port`: port to connect to Docker API on. Default: 4243
  - `host`: host to connect to Docker API on. Default: localhost
  - `version`: API version to target. Default: v1.8
  - `socketPath`: path to Docker socket on host. Use of this overrides host/port. Default: false
- `etcd`
  - `port`: port to connect to Etcd on. Default: 4001
  - `host`: host to connect to Etcd on. Default: localhost
  - `prefix`': the prefix to use for all Etcd registry entries. Default: /discover/
- `host`:
  - `ip`: the public IP address of the host to use for service routing. Default: IPv4 address of eth0
  - `realm`: name of the realm this instance of Discover is deployed in. Default: default
  - `id`: the unique ID of the host this instance of Discover is deployed to. Default: the AWS instance-id if availalbe, falling back to the hostname of the machine
- `debug`: enable debug logging
- `log`: path of file to redirect log output to

### Configuration via CLI

For any configuration value above, you can specify the value on the command line. For example, to set the realm of the host to `my-realm` you would specify `--host:realm my-realm` on the CLI.

### Configuration via File

Here is an example configuration file `config.json`:

```js
{
  "host": {
    "realm": "my-realm"
  }
}
```

To use this file you would start Discover using the CLI option `--config config.json`.

## Running Discover

Discover has dependencies on Docker and Etcd. It's designed to run one instance of Discover per instance of Docker, and idealy on the same machine that Docker is running on. Etcd does not need to be running on the same machine as Discover.

The setup of Docker and Etcd are outside of the scope of this document.

Once Docker and Etcd are setup, installing and running Discover is as simple as:

```bash
npm install -g docker-discover
discover --config config-file.json
```
