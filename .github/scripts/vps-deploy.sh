#!/usr/bin/env bash
# Runs on the machine, from the directory that holds docker-compose.prod.yml:
#   vps-deploy.sh <image tag> <smoke studio url> <smoke marketing url>
# Pulls the tagged images, brings the stack up and smokes it; on failure it
# puts the previous tag back so the site keeps running. The running tag is
# kept in ./current-tag and mirrored as IMAGE_TAG in `.env`, so plain
# `docker compose` commands on the machine act on the running version.
set -euo pipefail
umask 077

tag="${1:?image tag}"
studio_url="${2:?studio url}"
marketing_url="${3:?marketing url}"

up() {
	IMAGE_TAG="$1" docker compose -f docker-compose.prod.yml pull --quiet
	IMAGE_TAG="$1" docker compose -f docker-compose.prod.yml up -d --wait --wait-timeout 180 || true
}

record() {
	echo "$1" > current-tag
	grep -v '^IMAGE_TAG=' .env > .env.next || true
	echo "IMAGE_TAG=$1" >> .env.next
	mv .env.next .env
}

previous=$(cat current-tag 2>/dev/null || true)
echo "deploying $tag (running: ${previous:-none})"

up "$tag"
if ./smoke.sh "$studio_url" "$marketing_url"; then
	record "$tag"
	docker image prune -f >/dev/null
	echo "deployed $tag"
	exit 0
fi

echo "smoke failed on $tag"
if [ -n "$previous" ] && [ "$previous" != "$tag" ]; then
	echo "rolling back to $previous"
	up "$previous"
	record "$previous"
	./smoke.sh "$studio_url" "$marketing_url" && echo "rolled back to $previous"
fi
exit 1
