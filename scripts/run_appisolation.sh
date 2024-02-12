#!/bin/bash
echo "$@"
APP_ISOLATION_DOMAINS=$1 browser/build/browser --platform jimber --no-sandbox --disable-dev-shm-usage --disable-gpu ppapi-widevine-cdm --disable-features=InstalledApp $@

