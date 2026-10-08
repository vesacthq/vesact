#!/usr/bin/env bash
# Maps the triggering event to one deploy target and publishes its public URLs.
set -euo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
	# The PostHog key is public: it is compiled into the client bundle by design.
	cat >> "$GITHUB_ENV" <<'ENV'
TARGET=prod
VITE_STUDIO_URL=https://studio.allcast.cc
VITE_ACCOUNT_URL=https://studio.allcast.cc/account
VITE_RELAY_URL=https://console.vesact.com
VITE_RELAY_API_URL=https://api.vesact.com
VITE_VESACT_WWW_URL=https://www.vesact.com
VITE_MARKETING_URL=https://www.allcast.cc
VITE_POSTHOG_HOST=https://e.vesact.com
VITE_POSTHOG_KEY=phc_uLUk93bEHjHERp7hMxbDRiRPG4PefxhnzTkSGWYscgjR
ENV
else
	# No PostHog key here so preview traffic stays out of production analytics.
	cat >> "$GITHUB_ENV" <<'ENV'
TARGET=preview
CLOUDFLARE_ENV=preview
VITE_STUDIO_URL=https://app.preview.allcast.ai
VITE_ACCOUNT_URL=https://app.preview.allcast.ai/account
VITE_RELAY_URL=https://console.preview.vesact.com
VITE_RELAY_API_URL=https://api.preview.vesact.com
VITE_VESACT_WWW_URL=https://www.preview.vesact.com
VITE_MARKETING_URL=https://www.preview.allcast.ai
ENV
fi
