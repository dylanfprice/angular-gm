#!/bin/sh

rm -rf dist/ && \
grunt build && \
git checkout gh-pages && \
cp -r dist/* . && \
git add angular-gm-*.js && \
git add docs/ && \
git commit -m"Updating gh-pages to latest build."
git checkout master
