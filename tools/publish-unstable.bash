#!/usr/bin/env -S bash -euo pipefail
# Publish a development release (@next). See docs/publishing.md.
#
# Environment variables:
# - V: Verbose mode. Defaults to off.
#
# Example (if main is v0.0.0, publish v0.0.1-dev+2000-01-02.3):
#
#   tools/publish-unstable

set -${V:+x}

# Development tags are not wanted on the main branch. Checkout `HEAD` detached.
git fetch origin main
git checkout origin/main

# Validate the installation. See `npm help ci`.
npm ci

# This will create a new version commit on the detached `HEAD` like
# `v1.2.4-dev+2000-01-02.3`.
npm version prerelease --preid="-dev+$(TZ=utc date +%F)"

npm publish --tag next
