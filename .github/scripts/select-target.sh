#!/usr/bin/env bash
# Maps the triggering event to one deploy target and publishes its public URLs.
set -euo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
	# The PostHog key is public: it is compiled into the client bundle by design.
	cat >> "$GITHUB_ENV" <<'ENV'
TARGET=prod
STUDIO_WORKER=vesact-studio
ACCOUNT_WORKER=vesact-account
RELAY_WORKER=vesact-relay
VITE_STUDIO_URL=https://studio.vesact.com
VITE_ACCOUNT_URL=https://account.vesact.com
VITE_RELAY_URL=https://relay.vesact.com
VITE_RELAY_API_URL=https://api.vesact.com
VITE_MARKETING_URL=https://www.vesact.com
VITE_POSTHOG_HOST=https://e.vesact.com
VITE_POSTHOG_KEY=phc_uLUk93bEHjHERp7hMxbDRiRPG4PefxhnzTkSGWYscgjR
ENV
else
	# No PostHog key here so preview traffic stays out of production analytics.
	cat >> "$GITHUB_ENV" <<'ENV'
TARGET=preview
CLOUDFLARE_ENV=preview
STUDIO_WORKER=vesact-studio-preview
ACCOUNT_WORKER=vesact-account-preview
RELAY_WORKER=vesact-relay-preview
VITE_STUDIO_URL=https://studio.preview.vesact.com
VITE_ACCOUNT_URL=https://studio.preview.vesact.com/account
VITE_RELAY_URL=https://relay.preview.vesact.com
VITE_RELAY_API_URL=https://api.preview.vesact.com
VITE_MARKETING_URL=https://www.preview.vesact.com
ENV
fi
