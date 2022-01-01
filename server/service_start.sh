#!/bin/bash

echo "starting runner server"

cd /home/pi/running_monitor/server/src
sudo /usr/local/bin/node index.js 
cd - 

