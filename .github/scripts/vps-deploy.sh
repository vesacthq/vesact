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

compose() {
	docker compose -f docker-compose.prod.yml "$@"
}

up() {
	IMAGE_TAG="$1" compose up -d --wait --wait-timeout 180 || true
	# Caddy does not watch its file; a changed Caddyfile needs a reload.
	compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
}

record() {
	echo "$1" > current-tag
	grep -v '^IMAGE_TAG=' .env > .env.next || true
	echo "IMAGE_TAG=$1" >> .env.next
	mv .env.next .env
}

# Drops the images of tags other than the running one and its predecessor.
prune_images() {
	docker image ls --format '{{.Repository}}:{{.Tag}}' 'ghcr.io/vesacthq/vesact-*' |
		grep -vE ":($1|$2)$" |
		xargs -r docker image rm >/dev/null
	docker image prune -f >/dev/null
}

previous=$(cat current-tag 2>/dev/null || true)
[ -z "$previous" ] || record "$previous"
echo "deploying $tag (running: ${previous:-none})"

IMAGE_TAG="$tag" compose pull --quiet
up "$tag"
if ./smoke.sh "$studio_url" "$marketing_url"; then
	record "$tag"
	prune_images "$tag" "${previous:-$tag}"
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
