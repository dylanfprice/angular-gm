#!/bin/sh

VERSION=$(python -c "import json;package = json.load(open('package.json'));print(package['version'])")

grunt build && \
git checkout gh-pages && \
mkdir -p $VERSION
cp -r dist/* $VERSION/
git add $VERSION/
git commit -m"Updating gh-pages to latest build."
git checkout master

