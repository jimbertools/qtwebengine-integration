Proxy repo is found [here](https://labs.jimber.org/jimber_broker/proxy.py)

# Install

Install mkcert

`wget -O mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64`
`chmod +x mkcert`

Copy mkcert to bin 

`sudo cp mkcert /usr/local/bin/mkcert`

Create CAROOT certs

`mkcert -CAROOT`

Replace certs by root certificates

`cd ~/.local/share/mkcert`


Change the browser instance:

`vim proxy/plugin/filter_by_upstream.py`

Search for request.host change it.

`request.host='localhost-8000.jimbertesting.be' => url of the browser service`

# Build
Build the container

`make container`

# Run

Run the docker container

`docker run -it -p 8899:8899 -v /home/<NAME>/proxy.py/certs:/certs --rm abhinavsingh/proxy.py:latest  --hostname 0.0.0.0  --ca-cert-file /certs/ca-cert.pem --ca-key-file /certs/ca-key.pem --ca-signing-key-file /certs/ca-signing-key.pem --plugins proxy.plugin.FilterByUpstreamHostPlugin`

