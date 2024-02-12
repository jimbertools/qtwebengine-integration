import os

class BaseConfig(object):
    DEBUG = False #flask
    TESTING = False #flask
    PORT = 5000
    ORIGINS = ["*"]
    DOWNLOAD_PATH= os.getenv('DOWNLOAD_PATH', "/tmp/downloads")
    DOWNLOAD_FEATURE_ENABLED = False
    WEBCAM_ENABLED = 0
    AUTO_REMOVE = True
    PERSISTENT_CLIENT_STORAGE = True


class Development(BaseConfig):
    DEBUG = True
    ENV = 'dev'
    DOCKER_IMAGE = "jimberbrowser"
    DOCKER_NETWORK = "jimberbrowser"
    DOWNLOAD_FEATURE_ENABLED = True


class Testing(BaseConfig):
    DEBUG = True
    ENV = 'test'
    DOCKER_IMAGE = "jimberbrowser:testing"
    DOCKER_NETWORK = "jimberbrowser"
    DOWNLOAD_FEATURE_ENABLED = True
    # AUTO_REMOVE = False

class Sofie(BaseConfig):
    DEBUG = False
    TESTING = False
    ENV = 'sofiebrowser'
    DOCKER_IMAGE = "labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser:sofiebrowser"
    DOCKER_NETWORK = "jimberbrowser"
    DOWNLOAD_FEATURE_ENABLED = True
    
class Staging(BaseConfig):
    ENV = 'stag'
    DOCKER_IMAGE = "labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser:staging"
    DOCKER_NETWORK = "jimber_brokerv2_staging_net"
    DOWNLOAD_FEATURE_ENABLED = True
    # AUTO_REMOVE = False

class Production(BaseConfig):
    ENV = 'prod'
    DOCKER_IMAGE = "labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser:"+os.getenv('CI_COMMIT_TAG','invalid')
    DOCKER_NETWORK = "jimber_brokerv2_net"
    
class Demo(BaseConfig):
    ENV = 'demo'
    DOCKER_IMAGE = "labs.jimber.org:5006/jimber_broker/jimberqtskia/jimberbrowser:"+os.getenv('CI_COMMIT_TAG','invalid')
    DOCKER_NETWORK = "jimberbrowser"
    DOWNLOAD_FEATURE_ENABLED = True
    


config = {
    'development': 'config.Development',
    'staging': 'config.Staging',
    'production': 'config.Production',
    'testing': 'config.Testing',
    'sofiebrowser': 'config.Sofie',
    'demo':'config.Demo'
}


def configure_app(app):
    app.config.from_object(config[os.getenv('ENVIRONMENT', default = 'development')])
