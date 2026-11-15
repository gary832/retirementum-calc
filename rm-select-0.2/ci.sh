#!/usr/bin/env sh
# Clones the engine at the pinned commit and runs both suites. Any failure fails the build.
set -eu
COMMIT=e331e24dbf3928b1b553894d96289633f1bab157
DIR=$(mktemp -d)
git clone -q https://github.com/gary832/retirementum-calc.git "$DIR/calc"
git -C "$DIR/calc" checkout -q "$COMMIT"
node suite.js --repo="$DIR/calc"
node option-c-test.js --repo="$DIR/calc"
echo "rm-select acceptance: all checks passed"
