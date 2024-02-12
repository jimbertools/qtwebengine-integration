# Deploy a demo server

Sometimes we manually setup a demo server for a potential customer

## Setup port forward

In the unifi control panel setup a port forward from server ip to labs port 5006

## Docker

Use these commands to set it up

``` bash
#!/bin/bash

# docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
usermod -aG docker $USER

# docker-compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## reverse proxy

``` bash
git clone https://gitlab.com/alexander.mol/reverse_proxy.git
```

### nginx config

``` nginx
resolver 127.0.0.11;

server {
    listen 80;
    server_name _;
    include /etc/nginx/snippets/certbot.conf;

    location / {
        return 301 https://$host$request_uri;
    }    
}

server {
    listen 443 ssl;
    server_name <company-name>.jimber.org; 

    ssl_certificate /etc/letsencrypt/live/<company-name>.jimber.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<company-name>.jimber.org/privkey.pem;  

    proxy_connect_timeout 1d;
    proxy_send_timeout 1d;
    proxy_read_timeout 1d;
    keepalive_timeout  7200;

    location ~* /ws/ {
        set $upstream jimberbrowser_spawner;
        proxy_pass http://$upstream$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
    }
   
    location / {
        set $upstream jimberbrowser_spawner;
        proxy_pass http://$upstream$request_uri;
    }

}
```

## Environment

``` bash
docker network create jimberbrowser
echo "213.118.3.190 labs.jimber.org" >> /etc/hosts
```

create docker-compose.yml
``` yaml
version: "3.7"
services:
    jimberbrowser_spawner:
        container_name: jimberbrowser_spawner
        image: labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser_spawner:$CI_COMMIT_TAG
        environment: 
            - "ENVIRONMENT=demo"
            - "CI_COMMIT_TAG=$CI_COMMIT_TAG"
        restart: always
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock
            - /opt/jimber/downloads:/opt/jimber/browser/www/downloads
        networks:
            - jimberbrowser
            - reverse_proxy
networks:
    jimberbrowser:
        external:
            name: jimberbrowser
    reverse_proxy:
        external:
            name: reverse_proxy_default
```

### Run environment

Credentials can be found here:  
[https://labs.jimber.org/jimber_broker/jimberqtskia/-/settings/ci_cd](https://labs.jimber.org/jimber_broker/jimberqtskia/-/settings/ci_cd)

``` bash
docker login labs.jimber.org:5006 -u $DOCKER_USERNAME -p $DOCKER_PASSWORD
docker pull labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser:$CI_COMMIT_TAG
docker pull labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser_spawner:$CI_COMMIT_TAG

docker-compose up -d
```
