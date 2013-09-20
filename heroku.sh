#!/bin/bash

rm -rf dist/ && \
grunt build && \
git checkout heroku && \
cp dist/*.js . && \
cp -r dist/doc/* . &&
cp -r dist/doc/.htaccess . && \
cp index.html index.php && \
git add . && \
git commit -m"Update to latest angular-gm release." && \
git push heroku heroku:master && \
git checkout master 

