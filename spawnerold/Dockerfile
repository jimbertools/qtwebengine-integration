FROM nginx:latest

RUN mkdir -p /opt/jimber/browser
WORKDIR /opt/jimber/browser

RUN apt-get update && apt-get install -y --no-install-recommends iputils-ping \
    python3 python3-pip python3-setuptools python3-wheel curl \
    && rm -rf /var/lib/apt/lists/*

ENV DOCKERVERSION=19.03.5
RUN curl -fsSLO https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKERVERSION}.tgz \
    && tar xzvf docker-${DOCKERVERSION}.tgz --strip 1 \
    -C /usr/local/bin docker/docker \
    && rm docker-${DOCKERVERSION}.tgz

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
COPY dist .
COPY nginx.conf /etc/nginx/nginx.conf
COPY Routes /etc/nginx/Routes/
COPY wsgi.py wsgi.py
COPY app.py app.py
COPY config.py config.py
COPY spawner_api/ spawner_api
COPY start.sh start.sh
RUN chmod +x start.sh
CMD ./start.sh