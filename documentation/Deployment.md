# Browser deployment manual

## How to install browser isolation in your environment

### Prerequisites

Docker version >= 19.03.12
docker-compose version >= 1.26.2

#### Docker

Use these commands to set it up

```bash
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

### Installation

Replace all `$CI_COMMIT_TAG` with the version you want to deploy  
Replace `-u $USERNAME -p $PASSWORD` with the correct credentials

#### Step 1

Log in to our remote registry:

```bash
docker login registry.gitlab.com -u $USERNAME -p $PASSWORD
```

Import the spawner and the browser images into your local docker registry  
These can be found here:

- registry.gitlab.com/jimber/browser/jimberbrowser:$CI_COMMIT_TAG
- registry.gitlab.com/jimber/browser/jimberbrowser_spawner:$CI_COMMIT_TAG

Make sure to put the license file on your host system in the correct path: `/opt/jimber/browser/license`

#### Step 2

Create a docker-compose.yml configuration that suits your needs and create a docker network (e.g.: `jimber_brokerv2_net` ) for the isolated containers.

Example:

```yaml
version: "3.7"

services:
  spawner:
    container_name: jimberbrowser_spawner
    image: registry.gitlab.com/jimber/browser/jimberbrowser_spawner:$CI_COMMIT_TAG
    environment:
      - ENVIRONMENT=production
      - BROWSER_VERSION=$CI_COMMIT_TAG
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - default
      - proxy
    restart: always
networks:
  default:
    external:
      name: jimber_brokerv2_net
  proxy:
    external:
      name: proxy
```

Start the environment by running `docker-compose up` and check for any errors in the logs.

#### Step 3

It is advised to use a reverse proxy to connect to the environment.

```bash
mkdir certs
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./certs/nginx-selfsigned.key -out ./certs/nginx-selfsigned.crt
```

Example nginx config:

```nginx
resolver 127.0.0.11;

server {
  listen 80;
  server_name _;

  location / {
    return 301 https://$host$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name isolation.jimber.io;

  ssl_certificate /certificates/fullchain.pem;
  ssl_certificate_key /certificates/privkey.pem;

  location ~* /ws/ {
    set $upstream jimberbrowser_spawner;
    proxy_pass http://$upstream$request_uri;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";

  }

  location / {
    client_max_body_size 5G;
    set $upstream jimberbrowser_spawner;
    proxy_pass http://$upstream$request_uri;
  }
}

```

Example nginx docker-compose.yml

```yaml
version: "3.8"
services:
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs/:/certificates/
    command: '/bin/sh -c ''while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g "daemon off;"'''
    restart: always
    networks:
      proxy: {}
networks:
  proxy:
    external: true
    name: proxy
```

**Appisolation mode**

If you want to isolate an application, by putting our browser isolation solution in front of your application, please follow the next steps.

In your reverse proxy add following lines in the block where you proxy pass to the `jimberbrowser_spawner`

```nginx
	  proxy_set_header X-App-Isolation-Domains "example.com;subdomain.example.dom";
```

If you want to allow any other protocols, for example to open external applications.
Do not include `://`

```nginx
	  proxy_set_header X-App-Isolation-Protocols "protocol";
```

This is done in the reverse proxy so that we don't need to start 20 browser environments, we can just add more routes.

**Proxy mode**

If you want to use isolate your complete local environment, by putting our browser isolation solution in front of the complete world wide web

See Proxy.md

**force video rendering**

Because the current domrendering implementation might break, we currenly support a way to only use the video rendering solution. If please follow the next steps.

Add the `DOMRENDERING_DISABLED` environment variable to the spawner in the docker-compose.yml file
```yaml
    environment:
      - DOMRENDERING_DISABLED=true
```

#### Step 4

Connect to the environment and check the logs of your proxy and/or reverse proxy to see if anythings goes wrong
