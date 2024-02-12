#!/bin/bash
cd /tmp/ \
    && git clone https://github.com/protocolbuffers/protobuf.git \
    && cd protobuf \
    && git checkout v3.9.0 \
    && git submodule update --init --recursive \
    && ./autogen.sh \
    && ./configure \
    && make -j $1 \
    && make install \
    && ldconfig \
    && rm -rf /tmp/protobuf
