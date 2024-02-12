#!/bin/bash
echo "$@"
browser/build/browser --platform jimber --no-sandbox --disable-dev-shm-usage --disable-gpu ppapi-widevine-cdm --disable-features=InstalledApp $@

