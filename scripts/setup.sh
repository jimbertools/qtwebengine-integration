#!/bin/bash
set -e

startdir=$PWD

echo "Script for easier development environment setup"
echo -e "- by Jimber \n\n"

trap ctrl_c SIGINT

function ctrl_c() {
    echo
    echo "[-] SIGTRAP killing $PID"
    kill $PID
    sleep 1
}

getsubmodules() {
    echo '[-] Submodules'
    git submodule update --init
    echo 'done!'
    echo
}

compile_httpserver() {
    echo -ne '[-] HttpServer      \r'

    if ldconfig -p | grep httpServer &>/dev/null; then
        echo
        echo "httpServer already found! Skipping..."
        return
    fi

    cd browser/src/3rdparty/HttpServer
    echo -ne 'Setting up HttpServer\r'
    cat <<EOF >common.pri
INCLUDEPATH += ../../QtPromise
DEPENDPATH += ../../QtPromise
EOF

    cd src
    qmake &>/dev/null
    make -s &>/dev/null &
    PID=$!
    echo -ne '[-] Compiling HttpServer      \r\n'
    printf "["
    while kill -0 $PID 2>/dev/null; do
        printf "-"
        sleep 1
    done
    printf "] done!\n"
    sudo make install &>/dev/null
    cd $startdir
}

setup_proto() {
    echo
    echo '[-] Integration commands'
    cd $startdir/proto
    ./generate.py 1>/dev/null
    echo "done!"
    cd $startdir
    echo
}

install_protobuf() {
    echo '[-] Protobuf'
    if command -v protoc &>/dev/null; then
        command -v protoc
        echo "Protobuf already found! Skipping..."
        echo
        return
    fi
    echo
    sudo bash -c "bash $startdir/docker/install-scripts/install-protobuf.sh 4" &>/dev/null &
    PID=$!
    echo -ne '[-] Compiling Protobuf      \r\n'
    printf "["
    while sudo kill -0 $PID 2>/dev/null; do
        printf "-"
        sleep 1
    done
    printf "] done!\n"
    echo
}

setup_webengine() {
    echo "[-] QtWebEngine"
    echo "If you do not have a powerfull machine"
    echo "you will probably want to download the qtwebengine libs"
    echo "from the gitlab pipeline."
    read -p "Do you want to do this? y/n " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -z ${CUSTOM_WEB_ENGINE_DIR} ]; then
            echo "please set your CUSTOM_WEB_ENGINE_DIR environment variable"
            echo "All files will be placed there"
            exit 1
        fi
        get_custom_webengine
    else
        read -p "Do you want to compile webengine instead y/n " -n 1 -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            compile_webengine
            export CUSTOM_WEB_ENGINE_DIR=$startdir/browser/src/3rdparty/qt-webengine
        fi
    fi
}

get_custom_webengine() {
    bash scripts/get_webengine_libs.sh
}

compile_webengine() {
    echo 'WIP not working yet'
    return
    cd $startdir/browser/src/3rdparty/qt-webengine/src/3rdparty/chromium/third_party/blink/renderer/core/html/jimber/protobuf/
    mkdir cpp
    protoc -I=. --cpp_out=cpp/ ./*.proto
    cd $startdir/browser/src/3rdparty/qt-webengine/
    qmake -r CONFIG+=release -- -webengine-proprietary-codecs
    echo "qmake done... making... this might take 20 minutes on a 32/64 machine"
    make
    echo "make done!"
    cd $startdir
    echo
}

compile_browser() {
    echo
    echo '[-] Browser '
    echo 'This will throw some cmake errors which you probably can ignore'
    echo -ne 'Configuring Browser       \r'
    cd $startdir/browser
    mkdir build &>/dev/null || true
    cd build
    cmake .. 1>/dev/null
    echo -ne 'Compiling Browser       \r\n'
    make -j4 -s 1>/dev/null &
    PID=$!
    printf "["
    while kill -0 $PID 2>/dev/null; do
        printf "-"
        sleep 1
    done
    printf "] done!\n"
    cd $startdir
    echo
}

compile_qpa() {
    echo -ne '[-] QPA       \r\n'
    cd $startdir/qpa
    qmake
    make install -s 1>/dev/null &
    PID=$!
    echo -ne 'Compiling QPA \r\n'
    printf "["
    while kill -0 $PID 2>/dev/null; do
        printf "-"
        sleep 1
    done
    printf "] done!\n"
    cd $startdir
    echo
}

setup_nginx() {
    bash scripts/setup_webserver.sh $startdir
}

getsubmodules
compile_httpserver
setup_proto
install_protobuf
setup_webengine

echo $CUSTOM_WEB_ENGINE_DIR
if [ -z ${CUSTOM_WEB_ENGINE_DIR} ]; then
    echo "please set your CUSTOM_WEB_ENGINE_DIR environment variable"
    exit 1
fi

compile_browser
compile_qpa
setup_nginx

echo
echo "All is finished!"
echo "See documentation/Development.md#running for further instructions"
cd $startdir
