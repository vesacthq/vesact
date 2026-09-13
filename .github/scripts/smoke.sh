#!/usr/bin/env bash
# Smoke test of a running Studio unit: <studio url> <marketing url> [apex url].
# The same checks run against the CI compose stack and, from the machine
# itself, after a deploy; only the answers that need no data are asserted.
# Public hostnames are resolved to the local Caddy so the check does not
# depend on DNS or on the domain's 80/443 being reachable from outside.
# SMOKE_INSECURE=1 accepts Caddy's own CA (before the ICP filing).
set -euo pipefail

studio="${1:?studio url}"
marketing="${2:?marketing url}"
apex="${3:-}"

curl_local() {
	local url="$1" host port
	shift
	host=$(printf '%s' "$url" | sed -E 's#^https?://([^/:]+).*#\1#')
	case "$url" in https://*) port=443 ;; *) port=80 ;; esac
	if [ "$host" = "localhost" ]; then
		curl -sS "$@" "$url"
	else
		curl -sS ${SMOKE_INSECURE:+-k} --resolve "$host:$port:127.0.0.1" "$@" "$url"
	fi
}

check() {
	local expected="$1" url="$2" status
	status=$(curl_local "$url" -o /dev/null -w '%{http_code}' --max-time 30)
	if [ "$status" != "$expected" ]; then
		echo "FAIL $url -> $status (expected $expected)"
		exit 1
	fi
	echo "ok   $url -> $status"
}

# A signed-out visitor is sent to the account center; the login page renders.
check 307 "$studio/"
check 200 "$studio/account/login"
check 200 "$studio/api/health"
check 200 "$studio/account/api/health"
# Better Auth reaches the database: an unknown user is a 401, not a 500.
status=$(curl_local "$studio/account/api/auth/sign-in/email" -o /dev/null -w '%{http_code}' --max-time 30 -X POST \
	-H 'content-type: application/json' -H "origin: $studio" \
	-d '{"email":"nobody@example.com","password":"not-the-password-1"}')
[ "$status" = "401" ] || { echo "FAIL sign-in probe -> $status (expected 401)"; exit 1; }
echo "ok   sign-in probe -> 401"
check 200 "$marketing/"
# The bare domain only redirects to the marketing site.
if [ -n "$apex" ]; then
	location=$(curl_local "$apex/" -o /dev/null -w '%{redirect_url}' --max-time 30)
	[ "$location" = "$marketing/" ] || { echo "FAIL $apex/ -> $location (expected $marketing/)"; exit 1; }
	echo "ok   $apex/ -> $location"
fi
