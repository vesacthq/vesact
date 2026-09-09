#!/usr/bin/env bash
# Fails the deploy when the Worker that just went out does not answer.
set -euo pipefail

for url in "$@"; do
	for attempt in 1 2 3 4 5; do
		if curl -fsSL --max-time 20 -o /dev/null "$url"; then
			echo "ok $url"
			break
		fi
		if [ "$attempt" = 5 ]; then
			echo "unreachable after 5 attempts: $url" >&2
			exit 1
		fi
		sleep 5
	done
done
