#!/bin/bash

# Run `rm tsconfig.build.tsbuildinfo` if file exists to enable `npm run start:dev` run perfectly!
if [ -r tsconfig.build.tsbuildinfo ]; then
  rm tsconfig.build.tsbuildinfo
fi