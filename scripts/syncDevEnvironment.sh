#!/bin/bash
echo "Setting up dev environment"

# This script assumes offix is in the same directory as the sdk.

set -e

cd ../offix &&
rm -Rf node_modules &&
npm install &&
npm run bootstrap &&
npm run clean &&
npm run link &&
npm run build &&

cd ../aerogear-js-sdk/packages/sync &&
npm run clean &&
npm install &&
npm link offix-cache &&
npm link offix-offline &&
npm run build

echo "Repository is in development state"

