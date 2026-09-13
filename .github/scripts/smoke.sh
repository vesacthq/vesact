#!/usr/bin/env bash
# Smoke test of a running Studio unit: <studio url> <marketing url>.
# The same checks run against the CI compose stack and against the machine
# after a deploy; only the answers that need no data are asserted.
set -euo pipefail

studio="${1:?studio url}"
marketing="${2:?marketing url}"

check() {
	local expected="$1" url="$2" status
	status=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 "$url")
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
status=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 -X POST \
	-H 'content-type: application/json' -H "origin: $studio" \
	-d '{"email":"nobody@example.com","password":"not-the-password-1"}' \
	"$studio/account/api/auth/sign-in/email")
[ "$status" = "401" ] || { echo "FAIL sign-in probe -> $status (expected 401)"; exit 1; }
echo "ok   sign-in probe -> 401"
check 200 "$marketing/"
