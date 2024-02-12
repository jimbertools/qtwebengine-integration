#!/bin/bash
echo "Installing httpserver..."
cd /tmp/ \
    && git clone https://github.com/simonbrunel/qtpromise.git \
    && git clone https://github.com/addisonElliott/HttpServer.git \
    && touch HttpServer/common.pri \
    && echo "include(\"/tmp/qtpromise/qtpromise.pri\")" > HttpServer/common.pri \
    && cd HttpServer/src \
    && qmake \
    && make \
    && make install \
    && ldconfig \
    && rm -rf /tmp/qtpromise /tmp/HttpServer