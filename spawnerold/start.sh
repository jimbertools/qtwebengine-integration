#!/bin/bash
gunicorn --bind 0.0.0.0:5000 wsgi:app &
# nohup python3 app.py &>./python.log &
nginx -g "daemon off;"