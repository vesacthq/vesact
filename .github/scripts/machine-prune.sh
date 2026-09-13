#!/bin/sh
# Weekly on the machine (/etc/cron.weekly/vesact-prune): layers no tag points
# at, stopped containers, build cache and old journal entries. Tagged images
# are vps-deploy.sh's business: it keeps the running tag and its predecessor.
docker image prune -f
docker container prune -f
docker builder prune -f
journalctl --vacuum-size=200M
