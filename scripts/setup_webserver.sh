#!/bin/bash

setup_nginx() {
    echo '[-] NGINX'
    cd devserver
    sed "0,/root.*/{s/root.*/root ${1//\//\\/}\/client;/}" nginx.conf >/etc/nginx/conf.d/browser-devserver.conf
    bash ./getcerts.sh 1>/dev/null
    service nginx reload
    echo 'done!'
    echo "Devserver running on https://dev.jimbertesting.be"
    grep -qxF '127.0.0.1 dev.jimbertesting.be' /etc/hosts || echo '127.0.0.1 dev.jimbertesting.be' >>/etc/hosts
    grep -qxF '127.0.0.1 dev-isolation.jimbertesting.be' /etc/hosts || echo '127.0.0.1 dev-isolation.jimbertesting.be' >>/etc/hosts
    # grep -qxF '127.0.0.1 dev-spawner.jimbertesting.be' /etc/hosts || echo '127.0.0.1 dev-spawner.jimbertesting.be' >>/etc/hosts
    # grep -qxF '127.0.0.1 dev-spawner-isolation.jimbertesting.be' /etc/hosts || echo '127.0.0.1 dev-spawner-isolation.jimbertesting.be' >>/etc/hosts
    # todo ^
}

if [ -z ${1} ]; then
    echo "\$1 (destination) is unset"
    exit 0
fi

sudo bash -c "$(declare -f setup_nginx); setup_nginx $1"
