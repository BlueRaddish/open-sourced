#!/usr/bin/env bash
# Test contract: lint, unit tests, production build and server type-check - the same gate the Pages workflow runs.
set -e
cd "$(dirname "$0")"
npm run check
