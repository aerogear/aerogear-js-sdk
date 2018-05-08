#!/bin/bash

# do nothing if there's no plugin.xml
if [ ! -f plugin.xml ]; then
  exit 0;
fi

# grab version from package.json and update plugin.xml in place
VERSION=$(node -p 'require("./package.json").version;')
sed -i "s/VERSION/$VERSION/" plugin.xml
