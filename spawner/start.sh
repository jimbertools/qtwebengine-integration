#!/bin/bash
node index.js &
# nohup python3 app.py &>./python.log &
nginx -g "daemon off;"