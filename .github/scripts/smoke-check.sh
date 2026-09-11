#!/usr/bin/env bash
# Fails the deploy when the Worker that just went out does not answer.
# A failed attempt prints the status and Cloudflare's own headers, so a
# challenge (Bot Fight Mode: 403 with `cf-mitigated: challenge`) reads as
# such instead of as a Worker error.
set -euo pipefail

headers=()
if [ -n "${CF_ACCESS_CLIENT_ID:-}" ]; then
	headers=(-H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET")
fi

response_headers=$(mktemp)
trap 'rm -f "$response_headers"' EXIT

for url in "$@"; do
	for attempt in 1 2 3 4 5; do
		status=$(curl -sSL --max-time 20 -o /dev/null -D "$response_headers" -w '%{http_code}' ${headers[@]+"${headers[@]}"} "$url" || echo "000")
		if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
			echo "ok $url"
			break
		fi
		echo "attempt $attempt: $url -> $status $(grep -i -E '^(cf-ray|cf-mitigated|cf-placement):' "$response_headers" | tr -d '\r' | tr '\n' ' ')" >&2
		if [ "$attempt" = 5 ]; then
			echo "unreachable after 5 attempts: $url" >&2
			exit 1
		fi
		sleep 5
	done
done
