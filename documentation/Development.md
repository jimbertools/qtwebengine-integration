# Getting started with development

The browser isolation project consists of five parts

- The browser itself
- The Qt Platform Integration (QPA)
- A modified version of QtWebEngine
- An orchestrator (spawner)
- A frontend to interact with the isolated browser

Please re-read these instructions if any of your command fails.  
If we notice you didn't, you're on your own ¯\_(ツ)_/¯
## Dependencies

```bash
sudo apt install g++ make cmake jq nginx \
    libegl1-mesa-dev zlib1g-dev libavformat-dev libswscale-dev \
    libfreetype6-dev libfontconfig-dev libglib2.0-dev \
    libbrotli-dev autoconf libminizip-dev libevent-dev libmagick++-dev \
    python3-pip
```

python packages
```bash
pip install pyyaml
```


- [Qt](https://www.qt.io/download-qt-installer)

For Qt, make sure to put the libraries in your path. You can use `~/.bashrc` for this.  
Example:

```bash
export QTDIR="/home/<user>/Qt/5.15.2/gcc_64"
export PATH="$QTDIR/bin:$PATH"
export LD_LIBRARY_PATH="$QTDIR/lib:$LD_LIBRARY_PATH"
```

It might also be useful depending on what you are doing next to create an `.env` file in the root directory of the repository where you can store various secrets or paths.  
run `source .env` to activate them.  
`CUSTOM_WEB_ENGINE_DIR` could be `~/Code/Jimber/browser/webengine-gitlab-sources`

```bash
# https://labs.jimber.org/-/profile/personal_access_tokens token with API scope read_api is probably sufficient
export PRIVATE_TOKEN_GITLAB=<super-secret-token> 
export CUSTOM_WEB_ENGINE_DIR=/home/amol/code/jimber/qtwebengine-dom # Don't point to this repository !
export LD_LIBRARY_PATH=$CUSTOM_WEB_ENGINE_DIR/lib:$LD_LIBRARY_PATH
```

If you are feeling lucky (which you are) run `setup.sh`. That should install all other submodules/dependencies and compile the browser and QPA for you. It even installs an nginx devserver.

### Submodules

```bash
git submodule update --init
```

## Compiling

### Browser

#### WebEngine

If you do not have the power to compile QtWebEngine locally follow these steps (or run `setup.sh`):

- Create a token on https://labs.jimber.org/-/profile/personal_access_tokens and export it to `$PRIVATE_TOKEN_GITLAB`
- Download the correct artifact at https://labs.jimber.org/jimber/qtwebengine-dom/-/pipelines .
- extract it to a location of your choice
- point the `$CUSTOM_WEB_ENGINE_DIR` env var to the location of the extracted zipfile. Don't point it to this repository!

#### Compile the browser

We use cmake to compile the browser binary

```bash
cd browser
mkdir build
cd build
cmake ..
make
```

### QPA

We use qmake to compile the QPA library

```bash
cd qpa
qmake
make
make install
```

## Running

### Client

We need a way to serve the `client` folder's html files. For this there is an nginx.conf in the devserver folder and a script to download certificate files.

### Browser

Export the `lib` folder of your QtWebEngine in the `$LD_LIBRARY_PATH`.  
Example:

```bash
export LD_LIBRARY_PATH=$CUSTOM_WEB_ENGINE_DIR/lib:$LD_LIBRARY_PATH
# or
export LD_LIBRARY_PATH=/home/amol/code/jimber/qtwebengine-dom/lib:$LD_LIBRARY_PATH
```

Run the browser

```bash
./browser/build/browser --platform jimber --no-sandbox --disable-dev-shm-usage --disable-gpu --disable-features=InstalledApp
```

## Coding

## Docker

If you need to run the browser inside a docker, because maybe you want to emulate a deployed environment.  
Simply run `make docker`
```bash
docker run -ti --rm --name browser -p 9001:9001 
```

### Formatting

Todo
