#!/usr/bin/env bash
set -euo pipefail

version=3.13.3
sha256=e5bec3346a873ae91d871550f3e698c1aad962aff462a080e40f25fde17fef6b

curl -fsSL -o /tmp/sops "https://github.com/getsops/sops/releases/download/v${version}/sops-v${version}.linux.amd64"
echo "${sha256}  /tmp/sops" | sha256sum -c -
sudo install -m 0755 /tmp/sops /usr/local/bin/sops
