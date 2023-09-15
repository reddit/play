# Publishing

## Stable Release (`@latest`)

```bash
# Checkout the latest main branch.
git checkout main && git pull

# Review the changes since the last release.
git log "$(git describe --tags --abbrev=0)..@" --oneline

# Document changes since the last release.
vim changelog.md

# Stage the changelog.
git add changelog.md

# Commit the changelog.
git commit -m 'Version changelog'

# Version (patch, minor, or major), build, and test a release.
VERSION_TYPE=patch tools/publish-stable.bash

# Upload the play-*.html artifact. Click "generate release notes". Append
# `[**Repo changelog**](https://github.com/reddit/devvit-play/blob/main/docs/changelog.md)`.
open https://github.com/reddit/devvit-play/releases/new
```

## Unstable Development Release (`@next`)

```bash
# Checkout the latest main branch.
git checkout main && git pull

# Version, build, and test a release.
tools/publish-unstable.bash
```
