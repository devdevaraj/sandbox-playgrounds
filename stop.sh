#!/bin/bash

# Kill the binary process
sudo pkill -f ./bin/bender

# Kill the npm process (which started your Node.js app)
pkill -f "npm start"

echo "Binary and Node.js app (npm start) stopped."
