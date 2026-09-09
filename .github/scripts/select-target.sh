#!/usr/bin/env bash
# Maps the triggering event to one deploy target and publishes its public URLs.
set -euo pipefail

if [ "${GITHUB_EVENT_NAME:-}" = "push" ]; then
	# The PostHog key is public: it is compiled into the client bundle by design.
	cat >> "$GITHUB_ENV" <<'ENV'
TARGET=prod
STUDIO_WORKER=vesact-studio
VITE_STUDIO_URL=https://studio.vesact.com
VITE_AUTH_URL=https://auth.vesact.com
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
VITE_STUDIO_URL=https://vesact-studio-preview.vesact.workers.dev
VITE_AUTH_URL=https://vesact-studio-preview.vesact.workers.dev
VITE_MARKETING_URL=https://vesact-marketing-preview.vesact.workers.dev
ENV
fi
