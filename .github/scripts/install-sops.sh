#!/usr/bin/env bash
set -euo pipefail

version=3.13.3
sha256=e5bec3346a873ae91d871550f3e698c1aad962aff462a080e40f25fde17fef6b
asset="sops-v${version}.linux.amd64"

# The browser download URL for this asset has been answering 504 while the API path
# serves it fine; go through the API first and fall back to the plain URL.
rm -f "/tmp/${asset}"
gh release download "v${version}" -R getsops/sops -p "${asset}" -D /tmp \
	|| curl -fsSL --retry 5 --retry-delay 5 --retry-all-errors -o "/tmp/${asset}" \
		"https://github.com/getsops/sops/releases/download/v${version}/${asset}"
echo "${sha256}  /tmp/${asset}" | sha256sum -c -
sudo install -m 0755 "/tmp/${asset}" /usr/local/bin/sops
