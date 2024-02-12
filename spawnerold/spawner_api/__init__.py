from flask import Flask
from flask import Flask
from flask_cors import CORS
from config import BaseConfig
from config import configure_app
import docker

docker_client = docker.from_env()
app = Flask(__name__)

# print(BaseConfig.DOCKER_IMAGE)
# print(app.config)
# browser_image = BaseConfig.DOCKER_IMAGE
from spawner_api import controller

""" Corst settings will be here. We maybe use this endpoint later. """
cors = CORS(app, resources={
    r'/*': {
        'origins': BaseConfig.ORIGINS
    }
})


configure_app(app)

app.url_map.strict_slashes = False