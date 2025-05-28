#!/bin/bash

npm install
npm run build
BENDER_PATH="./bin/bender"
sudo "$BENDER_PATH" &
npm start
wait