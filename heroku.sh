#!/bin/bash

rm -rf dist/ && \
grunt build && \
git checkout heroku && \
cp dist/*.js . && \
cp -r node_modules/grunt-docular/node_modules/docular/lib/webapp/* . && \
cp -r node_modules/grunt-docular/node_modules/docular/lib/webapp/.htaccess . && \
cp index.html index.php && \
git add . && \
git commit -m"Update to latest angular-gm release." && \
git push heroku heroku:master && \
git checkout master 

