import argparse
import boto.ec2
import json
import requests

_config = None


def run():
    if _config['dryRun']:
        print "* performing dry run"

    # get all instances in the groups
    instances = [id for i in _config['accounts']
                 for r in _config['regions']
                 for id in get_instance_ids(*i, region=r)]
    data = requests.get('%s?recursive=true' % get_url()).json()

    failed = 0
    total = 0
    for key in dead_keys(instances, data):
        if _config['dryRun']:
            print "curl -X DELETE '%s%s?recursive=true'" % \
                (get_url(root=True), key)
            total += 1
            continue

        res = requests.delete('%s%s?recursive=true' %
                              (get_url(root=True), key))
        total += 1

        if res.status_code == 200:
            print "deleted %s" % key
        else:
            print "failed %s" % key
            failed += 1

    if failed:
        print "* FAILED: %s of %s" % (failed, total)
    else:
        print "* SUCCESS: %s" % total


def dead_keys(instances, data):
    dead = list(dead_hosts(instances))
    for key in find('key', data):
        for id in dead:
            if id in key and key.endswith(id):
                yield key


def dead_hosts(instances):
    data = requests.get('%s/host/' % get_url()).json()
    for host in find('key', data):
        parts = host.split('/')
        if len(parts) >= 4 and parts[3] not in instances:
            yield parts[3]


def get_instance_ids(accessKey, secretKey, region='us-west-1'):
    ec2 = boto.ec2.connect_to_region(
        region,
        aws_access_key_id=accessKey,
        aws_secret_access_key=secretKey)

    instances = ec2.get_only_instances(filters=_config['filters'])

    for instance in instances:
        if instance.id in _config['force']:
            continue

        yield instance.id


def find(key, dictionary):
    for k, v in dictionary.iteritems():
        if k == key:
            yield v
        elif isinstance(v, dict):
            for result in find(key, v):
                yield result
        elif isinstance(v, list):
            for d in v:
                for result in find(key, d):
                    yield result


def get_url(root=False):
    url = 'http://%s:%s/v2/keys' % \
        (_config['etcd']['host'], _config['etcd']['port'])

    if root:
        return url

    return '%s/%s' % (url, _config['etcd']['prefix'])


def configure():
    parser = argparse.ArgumentParser(description='reap stale discover records')

    parser.add_argument(
        '-n', '--dry-run', default=False, action='store_true',
        help='perform a dry run')

    parser.add_argument('-H', '--host', default='127.0.0.1')
    parser.add_argument('-P', '--port', default=4001)
    parser.add_argument('-p', '--prefix', default='discover',
                        help='application prefix')
    parser.add_argument('--force', action='append', default=[],
                        help="Instance ID's to force reaping")
    parser.add_argument('-c', '--config', default='config/reap.json',
                        help='configuration file')

    args = parser.parse_args()

    config = json.load(open(args.config, 'r'))

    if args.host:
        config['etcd']['host'] = args.host

    if args.port:
        config['etcd']['port'] = int(args.port)

    if args.prefix:
        config['etcd']['prefix'] = args.prefix

    if args.dry_run:
        config['dryRun'] = args.dry_run

    if args.force:
        config['force'] = args.force

    # set the loaded config to the global
    globals()['_config'] = config


if __name__ == '__main__':
    configure()
    run()
