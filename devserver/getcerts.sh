#!/bin/bash

rm -rf /opt/certs/jimbertesting
mkdir -p /opt/certs/jimbertesting || true
wget -q https://keys.jimbertesting.be/privkey.pem -P /opt/certs/jimbertesting
wget -q https://keys.jimbertesting.be/fullchain.pem -P /opt/certs/jimbertesting
ls -l /opt/certs/jimbertesting
echo "done!"