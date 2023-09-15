#!/usr/bin/env -S bash -euo pipefail
# Publish a development release (@next). See docs/publishing.md.
#
# Environment variables:
# - VERSION_PRE_ID: Prerelease package version identifier for reproduction.
#                   Defaults to current timestamp.
# - V: Verbose mode. Defaults to off.
#
# Example (if main is v0.0.0, publish v0.0.1-dev+2000-01-02T0304):
#
#   tools/publish-unstable

set -${V:+x}

# A timestamp is used to avoid conflicts as only one tag or version can ever
# exist. Additionally, the special NPM tags, `@latest` and `@next`, cannot point
# to the same version.
VERSION_PRE_ID="${VERSION_PRE_ID:-dev+$(TZ=utc date +%FT%H%M)}"

# Development tags are not wanted on the main branch. Checkout `HEAD` detached.
git fetch origin main
git checkout origin/main

# Validate the installation. See `npm help ci`.
npm ci

# This will create a new version commit on the detached `HEAD` like
# `v1.2.4-dev+2000-01-02T0304`.
npm version prerelease --preid="$VERSION_PRE_ID"

npm publish --tag next
