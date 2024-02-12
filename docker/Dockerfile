FROM qtcodebuilder:5.15.2 as builder

RUN echo "hi"
# ARG PRIVATE_TOKEN_GITLAB
# ARG CACHEBUSTER
# ENV CUSTOM_WEB_ENGINE_DIR=/tmp/webengine
# # RUN curl --location --output artifacts.zip -k --header "PRIVATE-TOKEN: $PRIVATE_TOKEN_GITLAB" https://labs.jimber.org/api/v4/projects/36/jobs/artifacts/5.15.2/download?job=build:qtwebengine ;
# # RUN unzip artifacts.zip
# COPY get_webengine_libs.sh get_webengine_libs.sh
# RUN chmod +x get_webengine_libs.sh && ./get_webengine_libs.sh

FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt install -y wget python libnss3 libegl1-mesa-dev libfontconfig libxcomposite1 \
    libxcursor1 libxdamage1 \
    libxext6 libxfixes3 \
    libxi6 libxrandr2 \
    libxrender1 libxss1 \
    libxtst6 libasound2 \
    libdbus-1-3 libglib2.0-0 \
    libavformat58 libswscale5 \
    iputils-ping alsa libasound2 pulseaudio \
    v4l2loopback-dkms ffmpeg libpulse-mainloop-glib0 \
    libevent-dev libwebp-dev libminizip-dev libwebpdemux2 libz-dev \
    brotli libmagick++-dev
RUN apt install fonts-noto-color-emoji fonts-freefont-ttf git dh-autoreconf -y
RUN apt-get install fonts-noto-cjk fonts-indic --no-install-recommends -y
RUN apt-get update -y && echo ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true | debconf-set-selections && apt-get install -y ttf-mscorefonts-installer
RUN apt-get install -y tzdata
ENV QTDIR=/opt/Qt/5.15.2/gcc_64
ENV PATH="$QTDIR/bin:$PATH"
ENV LD_LIBRARY_PATH="$QTDIR/lib:$LD_LIBRARY_PATH"
RUN mkdir -p /opt/jimber
RUN mkdir /tmp/uploads
WORKDIR /opt/jimber
RUN echo "Good job, please show us how you did this at security@jimber.org" > /flag.txt
COPY --from=builder /opt/Qt/5.15.2/gcc_64 /opt/Qt/5.15.2/gcc_64
# COPY --from=builder src/webenginewidgets/api /opt/Qt/5.15.2/gcc_64/include/QtWebEngineWidgets

COPY install-scripts install-scripts
RUN chmod +x install-scripts/* && run-parts --exit-on-error --regex '.*sh$' install-scripts

COPY  qtwebengine/lib /opt/Qt/5.15.2/gcc_64/lib
COPY  qtwebengine/include /opt/Qt/5.15.2/gcc_64/include
# COPY --from=builder /home/user/libexec/QtWebEngineProcess /opt/jimber/QtWebEngineProcess
COPY start_webcam.sh start_webcam.sh
COPY start_audio.sh start_audio.sh
COPY start_microphone.sh start_microphone.sh
COPY start.sh start.sh
COPY image.webm image.webm
COPY input.mp3 input.mp3
RUN chmod +x start.sh start_audio.sh start_webcam.sh start_microphone.sh
COPY ./libs /opt/Qt/5.15.2/gcc_64/plugins/platforms
COPY ./bins /opt/jimber
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# CMD ["/opt/jimber/browser", "--platform", "jimber", "--no-sandbox", "--disable-dev-shm-usage"]
CMD ["./start.sh"]