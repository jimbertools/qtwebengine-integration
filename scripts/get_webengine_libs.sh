#!/bin/bash
set -e 
echo "[+] Getting webengine..."
commitsha=$(git submodule | grep "qtwebengine-dom" | awk '{print $1}'|  sed 's/-//')
echo "Commitsha: $commitsha"
cd /tmp
token=$PRIVATE_TOKEN_GITLAB
projectid=36
mkdir -p $CUSTOM_WEB_ENGINE_DIR || true

pipelineid=$(curl -sk "https://labs.jimber.org/api/v4/projects/$projectid/repository/commits/$commitsha?private_token=$token" | jq '.last_pipeline.id')
jobid=$(curl -sk "https://labs.jimber.org/api/v4/projects/$projectid/pipelines/$pipelineid/jobs?private_token=$token" | jq '.[0].id')

echo -e "[+] Downloading job $jobid's artifacts"
curl -o /tmp/archive.zip -k "https://labs.jimber.org/api/v4/projects/$projectid/jobs/$jobid/artifacts?private_token=$token"

echo -e "[+] Unzipping..."
unzip /tmp/archive.zip -d $CUSTOM_WEB_ENGINE_DIR 1>/dev/null
rm -rf $CUSTOM_WEB_ENGINE_DIR/include/{QtPdf,QtPdfWidgets,QtWebEngine,QtWebEngineCore}
rm /tmp/archive.zip
echo "done!"