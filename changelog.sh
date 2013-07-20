#!/bin/sh

git log $1...$2 --pretty=format:'+ [view commit](http://github.com/dylanfprice/angular-gm/commit/%H) &bull; %s ' --reverse | grep -v Merge

