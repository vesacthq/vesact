#!/usr/bin/env bash
# Decrypts one secrets file into the job environment, masking every value in the log.
set -euo pipefail

sops -d "$1" | while IFS='=' read -r key value; do
	[ -z "$key" ] && continue
	echo "::add-mask::$value"
	echo "$key=$value" >> "$GITHUB_ENV"
done
