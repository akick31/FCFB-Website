#!/bin/sh
# Runs as part of the official nginx image's /docker-entrypoint.d/ hook chain,
# before nginx itself starts. Starts the OG-meta sidecar in the background so
# nginx can proxy bot traffic to it on the loopback interface.
set -e

node /app/og-meta/server.js &
