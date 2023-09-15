#!/usr/bin/env -S bash -euo pipefail
# Publish a stable release (@latest). See docs/publishing.md.
#
# Environment variables:
# - VERSION_TYPE: Required release type: patch, minor, or major.
# - V: Verbose mode. Defaults to off.
#
# Example (if main is v0.0.1-rc.0, publish v0.0.1):
#
#   VERSION_TYPE=patch tools/publish-stable

set -${V:+x}

# Make sure the current branch is up to date. This branch should have a
# local-only commit to revise the changelog.
git pull

# Clear outdated artifacts.
npm run clean

# Validate the installation. See `npm help ci`.
npm ci

# This will create a new version commit on the current branch like `v1.2.3`.
npm version "$VERSION_TYPE"

npm publish
