#!/bin/bash
set -e
export CUSTOM_WEB_ENGINE_DIR=/tmp/webengine
cd /opt/qtcodebuilder/code
git submodule update
bash scripts/get_webengine_libs.sh
make browser