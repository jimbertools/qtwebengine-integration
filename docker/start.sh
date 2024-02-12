#!/bin/bash
# /usr/bin/pulseaudio --start --realtime
# pacat --record -d auto_null.monitor --latency-msec=0
./start_webcam.sh &
# sleep 1
# ffmpeg -re -i image.webm -f v4l2 /dev/video* &
# sleep 1
./start_audio.sh &
# ./start_microphone.sh &
# https://bugreports.qt.io/browse/QTBUG-89740 LinkedIn Crash --disable-features=InstalledApp
echo "$QTDIR/plugins/ppapi/libwidevinecdm.so application/x-ppapi-widevine-cdm"
/opt/jimber/browser --platform jimber --no-sandbox --register-pepper-plugins="$QTDIR/plugins/ppapi/libwidevinecdm.so application/x-ppapi-widevine-cdm" --disable-dev-shm-usage --disable-features=InstalledApp
